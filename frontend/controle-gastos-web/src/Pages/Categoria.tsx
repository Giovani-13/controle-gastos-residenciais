import { useEffect, useState } from "react";
import { Categoria, CategoriaInput, FinalidadeCategoria } from "../Types";
import { criarCategoria, listarCategorias, atualizarCategoria, deletarCategoria } from "../Services/api";

export default function CategoriaPage() {
  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState<FinalidadeCategoria>("despesa");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editFinalidade, setEditFinalidade] = useState<FinalidadeCategoria>("despesa");

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    try {
      setErro("");
      const dados = await listarCategorias();
      setCategorias(dados);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao listar categorias.");
    }
  }

  function validarCategoria(input: CategoriaInput): string | null {
    if (!input.descricao?.trim()) return "Informe uma descrição.";
    if (!input.finalidade) return "Informe a finalidade.";
    return null;
  }

  async function handleCriarCategoria() {
    setMensagem("");
    setErro("");

    const payload: CategoriaInput = {
      descricao: descricao.trim(),
      finalidade,
    };

    const validacao = validarCategoria(payload);
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      await criarCategoria(payload);
      setMensagem("Categoria criada com sucesso!");
      setDescricao("");
      setFinalidade("despesa");
      await carregarCategorias();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao criar categoria.");
    }
  }

  function iniciarEdicao(c: Categoria) {
    setEditandoId(c.id);
    setEditDescricao(c.descricao);
    setEditFinalidade(c.finalidade);
    setMensagem("");
    setErro("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditDescricao("");
    setEditFinalidade("despesa");
  }

  async function salvarEdicao() {
    if (editandoId == null) return;

    setMensagem("");
    setErro("");

    const payload: CategoriaInput = {
      descricao: editDescricao.trim(),
      finalidade: editFinalidade,
    };

    const validacao = validarCategoria(payload);
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      await atualizarCategoria(editandoId, payload);
      setMensagem("Categoria atualizada com sucesso!");
      cancelarEdicao();
      await carregarCategorias();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao atualizar categoria.");
    }
  }

  async function excluirCategoria(id: number) {
    setMensagem("");
    setErro("");

    const ok = confirm("Tem certeza que deseja excluir esta categoria?");
    if (!ok) return;

    try {
      await deletarCategoria(id);
      setMensagem("Categoria excluída com sucesso!");
      await carregarCategorias();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao excluir categoria.");
    }
  }

  function finalidadeLabel(v: FinalidadeCategoria) {
    if (v === "despesa") return "Despesa";
    if (v === "receita") return "Receita";
    return "Ambas";
  }

  function finalidadeBadgeClass(v: FinalidadeCategoria) {
    if (v === "despesa") return "badge-soft-danger";
    if (v === "receita") return "badge-soft-success";
    return "badge-soft";
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Categorias</h3>
        <span className="badge badge-soft">
          {categorias.length} cadastrada{categorias.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3">
          <div className="fw-semibold">Cadastrar categoria</div>
          <div className="text-secondary small">Crie categorias para receitas, despesas ou ambas.</div>
        </div>

        <div className="card-body">
          {erro && <div className="alert alert-danger py-2 mb-3">{erro}</div>}
          {mensagem && <div className="alert alert-success py-2 mb-3">{mensagem}</div>}

          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-7">
              <label className="form-label">Descrição</label>
              <input
                className="form-control"
                type="text"
                placeholder="Ex.: Mercado, Salário..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Finalidade</label>
              <select
                className="form-select"
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value as FinalidadeCategoria)}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
                <option value="ambas">Ambas</option>
              </select>
            </div>

            <div className="col-12 col-md-2 d-grid">
              <button type="button" className="btn btn-primary" onClick={handleCriarCategoria}>
                <i className="bi bi-plus-lg me-2" />
                Cadastrar
              </button>
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
              <th style={{ width: 160 }}>Finalidade</th>
              <th style={{ width: 240 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((c) => {
              const estaEditando = editandoId === c.id;

              return (
                <tr key={c.id}>
                  <td className="text-secondary">#{c.id}</td>

                  <td>
                    {estaEditando ? (
                      <input
                        className="form-control form-control-sm"
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value)}
                      />
                    ) : (
                      <span className="fw-semibold">{c.descricao}</span>
                    )}
                  </td>

                  <td>
                    {estaEditando ? (
                      <select
                        className="form-select form-select-sm"
                        value={editFinalidade}
                        onChange={(e) => setEditFinalidade(e.target.value as FinalidadeCategoria)}
                      >
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                        <option value="ambas">Ambas</option>
                      </select>
                    ) : (
                      <span className={`badge ${finalidadeBadgeClass(c.finalidade)}`}>
                        {finalidadeLabel(c.finalidade)}
                      </span>
                    )}
                  </td>

                  <td>
                    {estaEditando ? (
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-success" onClick={salvarEdicao}>
                          <i className="bi bi-check2 me-1" />
                          Salvar
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelarEdicao}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => iniciarEdicao(c)}>
                          <i className="bi bi-pencil-square me-1" />
                          Editar
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => excluirCategoria(c.id)}>
                          <i className="bi bi-trash me-1" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
