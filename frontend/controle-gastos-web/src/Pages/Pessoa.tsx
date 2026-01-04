import React, { useEffect, useState } from "react";
import { Pessoa, PessoaInput } from "../Types";
import { criarPessoa, listarPessoas, atualizarPessoa, deletarPessoa } from "../Services/api";

export default function PessoaPage() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number>(0);

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [mensagem, setMensagem] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editIdade, setEditIdade] = useState<number>(0);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setErro("");
      const dados = await listarPessoas();
      setPessoas(dados);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao listar pessoas.");
    }
  }

  function validarPessoa(input: PessoaInput): string | null {
    if (!input.nome?.trim()) return "Informe um nome.";
    if (!Number.isInteger(input.idade) || input.idade <= 0) return "Idade deve ser um inteiro positivo.";
    return null;
  }

  async function handleCriar() {
    setMensagem("");
    setErro("");

    const payload: PessoaInput = { nome: nome.trim(), idade };
    const validacao = validarPessoa(payload);
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      await criarPessoa(payload);
      setMensagem("Pessoa criada com sucesso!");
      setNome("");
      setIdade(0);
      await carregar();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao criar pessoa.");
    }
  }

  function iniciarEdicao(p: Pessoa) {
    setEditandoId(p.id);
    setEditNome(p.nome);
    setEditIdade(p.idade);
    setMensagem("");
    setErro("");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditNome("");
    setEditIdade(0);
  }

  async function salvarEdicao() {
    if (editandoId == null) return;

    setMensagem("");
    setErro("");

    const payload: PessoaInput = { nome: editNome.trim(), idade: editIdade };
    const validacao = validarPessoa(payload);
    if (validacao) {
      setErro(validacao);
      return;
    }

    try {
      await atualizarPessoa(editandoId, payload);
      setMensagem("Pessoa atualizada com sucesso!");
      cancelarEdicao();
      await carregar();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao atualizar pessoa.");
    }
  }

  async function excluirPessoa(id: number) {
    setMensagem("");
    setErro("");

    const ok = confirm("Tem certeza que deseja excluir esta pessoa? Isso apagará as transações dela.");
    if (!ok) return;

    try {
      await deletarPessoa(id);
      setMensagem("Pessoa excluída com sucesso!");
      await carregar();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao excluir pessoa.");
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Pessoas</h3>
        <span className="badge badge-soft">
          {pessoas.length} cadastrada{pessoas.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3">
          <div className="fw-semibold">Cadastrar pessoa</div>
          <div className="text-secondary small">Informe nome e idade para adicionar à lista.</div>
        </div>

        <div className="card-body">
          {mensagem && <div className="alert alert-success py-2 mb-3">{mensagem}</div>}
          {erro && <div className="alert alert-danger py-2 mb-3">{erro}</div>}

          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                type="text"
                placeholder="Ex.: João Carlos"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Idade</label>
              <input
                className="form-control"
                type="number"
                placeholder="0"
                value={idade === 0 ? "" : idade}
                onChange={(e) => setIdade(Number(e.target.value))}
              />
            </div>

            <div className="col-12 col-md-3 d-grid">
              <button type="button" className="btn btn-primary" onClick={handleCriar}>
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
              <th>Nome</th>
              <th style={{ width: 140 }}>Idade</th>
              <th style={{ width: 220 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {pessoas.map((p) => {
              const emEdicao = editandoId === p.id;

              return (
                <tr key={p.id}>
                  <td className="text-secondary">#{p.id}</td>

                  <td>
                    {emEdicao ? (
                      <input
                        className="form-control form-control-sm"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                      />
                    ) : (
                      <span className="fw-semibold">{p.nome}</span>
                    )}
                  </td>

                  <td>
                    {emEdicao ? (
                      <input
                        className="form-control form-control-sm"
                        type="number"
                        value={editIdade}
                        onChange={(e) => setEditIdade(Number(e.target.value))}
                      />
                    ) : (
                      <span>{p.idade}</span>
                    )}
                  </td>

                  <td>
                    {emEdicao ? (
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
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => iniciarEdicao(p)}>
                          <i className="bi bi-pencil-square me-1" />
                          Editar
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => excluirPessoa(p.id)}>
                          <i className="bi bi-trash me-1" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {pessoas.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  Nenhuma pessoa cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
