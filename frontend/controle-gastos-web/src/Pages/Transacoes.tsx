import { useEffect, useMemo, useState } from "react";
import { Categoria, Pessoa, Transacao, TransacaoInput, TipoTransacao, FinalidadeCategoria } from "../Types";
import {
  criarTransacao,
  listarTransacoes,
  listarPessoas,
  listarCategorias,
  deletarTransacao,
  atualizarTransacao,
} from "../Services/api";
import Swal from "sweetalert2";

export default function TransacoesPage() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [pessoaId, setPessoaId] = useState<number>(0);
  const [categoriaId, setCategoriaId] = useState<number>(0);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      await Promise.all([carregarPessoas(), carregarCategorias(), carregarTransacoes()]);
    })();
  }, []);

	function avisarMenorIdadeReceita() {
	  return Swal.fire({
		icon: "warning",
		title: "Não permitido",
		text: "Não é permitido cadastrar uma Receita para menores de 18 anos.",
		confirmButtonText: "OK",
	  });
	}

  async function carregarPessoas() {
    try {
      setErro("");
      setPessoas(await listarPessoas());
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao listar pessoas.");
    }
  }

  async function carregarCategorias() {
    try {
      setErro("");
      setCategorias(await listarCategorias());
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao listar categorias.");
    }
  }

  async function carregarTransacoes() {
    try {
      setErro("");
      setTransacoes(await listarTransacoes());
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao listar transações.");
    }
  }

  const pessoaSelecionada = useMemo(() => {
    return pessoas.find((p) => p.id === pessoaId) ?? null;
  }, [pessoas, pessoaId]);

  useEffect(() => {
    if (pessoaSelecionada && pessoaSelecionada.idade < 18) {
      setTipo("despesa");
    }
  }, [pessoaSelecionada]);

  const categoriasCompatíveis = useMemo(() => {
    function compativel(finalidade: FinalidadeCategoria) {
      if (tipo === "despesa") return finalidade === "despesa" || finalidade === "ambas";
      return finalidade === "receita" || finalidade === "ambas";
    }

    return categorias.filter((c) => compativel(c.finalidade));
  }, [categorias, tipo]);

  useEffect(() => {
    if (categoriaId === 0) return;
    const existe = categoriasCompatíveis.some((c) => c.id === categoriaId);
    if (!existe) setCategoriaId(0);
  }, [categoriasCompatíveis, categoriaId]);

  function validarTransacao(input: TransacaoInput): string | null {
    if (!input.descricao?.trim()) return "Informe uma descrição.";
    if (input.valor <= 0) return "Valor deve ser maior que zero.";
    if (!input.pessoaId) return "Selecione uma pessoa.";
    if (!input.categoriaId) return "Selecione uma categoria.";
    if (!input.tipo) return "Informe o tipo.";

    const pessoa = pessoas.find((p) => p.id === input.pessoaId);
    if (pessoa && pessoa.idade < 18 && input.tipo !== "despesa") {
      return "Pessoa menor de idade só pode registrar despesas.";
    }

    const cat = categorias.find((c) => c.id === input.categoriaId);
    if (cat) {
      if (input.tipo === "despesa" && !(cat.finalidade === "despesa" || cat.finalidade === "ambas")) {
        return "Categoria selecionada não é compatível com DESPESA.";
      }
      if (input.tipo === "receita" && !(cat.finalidade === "receita" || cat.finalidade === "ambas")) {
        return "Categoria selecionada não é compatível com RECEITA.";
      }
    }

    return null;
  }

  async function salvarTransacao() {
    setMensagem("");
    setErro("");

    const payload: TransacaoInput = {
      descricao: descricao.trim(),
      valor,
      tipo,
      pessoaId,
      categoriaId,
    };

    const validacao = validarTransacao(payload);
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      if (editandoId == null) {
        await criarTransacao(payload);
        setMensagem("Transação criada com sucesso!");
      } else {
        await atualizarTransacao(editandoId, payload);
        setMensagem("Transação atualizada com sucesso!");
      }

      setDescricao("");
      setValor(0);
      setTipo("despesa");
      setPessoaId(0);
      setCategoriaId(0);
      setEditandoId(null);

      await carregarTransacoes();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao salvar transação.");
    }
  }

  function iniciarEdicao(t: Transacao) {
    setEditandoId(t.id);
    setDescricao(t.descricao);
    setValor(t.valor);
    setTipo(t.tipo);
    setPessoaId(t.pessoaId);
    setCategoriaId(t.categoriaId);

    setMensagem("");
    setErro("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setDescricao("");
    setValor(0);
    setTipo("despesa");
    setPessoaId(0);
    setCategoriaId(0);
  }

  async function excluirTransacao(id: number) {
    setMensagem("");
    setErro("");

    const ok = confirm("Deseja excluir esta transação?");
    if (!ok) return;

    try {
      await deletarTransacao(id);
      setMensagem("Transação excluída com sucesso!");
      await carregarTransacoes();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao excluir transação.");
    }
  }

  function tipoLabel(v: TipoTransacao) {
    return v === "despesa" ? "Despesa" : "Receita";
  }
  function finalidadeLabel(v: FinalidadeCategoria) {
    if (v === "despesa") return "Despesa";
    if (v === "receita") return "Receita";
    return "Ambas";
  }

  function nomePessoa(id: number) {
    return pessoas.find((p) => p.id === id)?.nome ?? `#${id}`;
  }
  function nomeCategoria(id: number) {
    const c = categorias.find((x) => x.id === id);
    return c ? `${c.descricao} (${finalidadeLabel(c.finalidade)})` : `#${id}`;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Transações</h3>
        <span className="badge badge-soft">
          {transacoes.length} lançada{transacoes.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3">
          <div className="fw-semibold">{editandoId == null ? "Cadastrar transação" : `Editando transação #${editandoId}`}</div>
          <div className="text-secondary small">Preencha os campos e salve. Regras de compatibilidade permanecem as mesmas.</div>
        </div>

        <div className="card-body">
          {mensagem && <div className="alert alert-success py-2 mb-3">{mensagem}</div>}
          {erro && <div className="alert alert-danger py-2 mb-3">{erro}</div>}

          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label className="form-label">Descrição</label>
              <input
                className="form-control"
                type="text"
                placeholder="Ex.: Conta de luz"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label">Valor</label>
              <input
                className="form-control"
                type="number"
                placeholder="0"
                value={valor === 0 ? "" : valor}
                onChange={(e) => setValor(Number(e.target.value))}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoTransacao)}
                disabled={!!pessoaSelecionada && pessoaSelecionada.idade < 18}
                title={pessoaSelecionada && pessoaSelecionada.idade < 18 ? "Menor de idade: somente despesa" : ""}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>

            <div className="col-12 col-lg-2">
              <label className="form-label">Pessoa</label>
              <select className="form-select" value={pessoaId} onChange={async (e) => {
			  const novoId = Number(e.target.value);
			  const pessoaSelecionada = pessoas.find((p) => p.id === novoId);

			  // sempre atualiza a pessoa selecionada
			  setPessoaId(novoId);
			  // Se está em Receita e escolheu menor de 18, volta para Despesa e avisa
			  if (pessoaSelecionada && pessoaSelecionada.idade < 18 && tipo === "receita") {
					setTipo("despesa");
					await avisarMenorIdadeReceita();
				}
				}}>
                <option value={0}>Selecione</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.idade})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-lg-2">
              <label className="form-label">Categoria</label>
              <select className="form-select" value={categoriaId} onChange={(e) => setCategoriaId(Number(e.target.value))}>
                <option value={0}>Selecione</option>
                {categoriasCompatíveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.descricao} ({finalidadeLabel(c.finalidade)})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={salvarTransacao}>
                <i className={`bi ${editandoId == null ? "bi-plus-lg" : "bi-check2"} me-2`} />
                {editandoId == null ? "Cadastrar" : "Salvar"}
              </button>

              {editandoId != null && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicao}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <h4 className="h6 text-uppercase text-secondary mb-2">Lista</h4>

      <div className="table-responsive">
        <table className="table table-sm table-striped table-hover align-middle">
          <thead>
            <tr>
              <th style={{ width: 90 }}>ID</th>
              <th>Descrição</th>
              <th style={{ width: 140 }} className="text-end">
                Valor
              </th>
              <th style={{ width: 130 }}>Tipo</th>
              <th style={{ width: 220 }}>Pessoa</th>
              <th>Categoria</th>
              <th style={{ width: 240 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id}>
                <td className="text-secondary">#{t.id}</td>
                <td className="fw-semibold">{t.descricao}</td>
                <td className="text-end">{t.valor}</td>
                <td>
                  <span className={`badge ${t.tipo === "despesa" ? "badge-soft-danger" : "badge-soft-success"}`}>
                    {tipoLabel(t.tipo)}
                  </span>
                </td>
                <td>{nomePessoa(t.pessoaId)}</td>
                <td className="text-secondary">{nomeCategoria(t.categoriaId)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => iniciarEdicao(t)}>
                      <i className="bi bi-pencil-square me-1" />
                      Editar
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => excluirTransacao(t.id)}>
                      <i className="bi bi-trash me-1" />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {transacoes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-secondary py-4">
                  Nenhuma transação cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
