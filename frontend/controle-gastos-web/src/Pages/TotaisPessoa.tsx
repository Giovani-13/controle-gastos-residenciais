import { useEffect, useMemo, useState } from "react";
import { TotaisPessoa } from "../Types";
import { totaisPorPessoa } from "../Services/api";

export default function TotaisPessoaPage() {
  const [totais, setTotais] = useState<TotaisPessoa[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarTotais();
  }, []);

  async function carregarTotais() {
    try {
      setErro("");
      const dados = await totaisPorPessoa();
      setTotais(dados);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar totais por pessoa.");
    }
  }

  const totalGeral = useMemo(() => {
    return totais.reduce(
      (acc, t) => {
        acc.receitas += t.receitas;
        acc.despesas += t.despesas;
        acc.saldo += t.saldo;
        return acc;
      },
      { receitas: 0, despesas: 0, saldo: 0 }
    );
  }, [totais]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Totais por Pessoa</h3>
        <span className="badge badge-soft">{totais.length} pessoa{totais.length === 1 ? "" : "s"}</span>
      </div>

      {erro && <div className="alert alert-danger py-2 mb-3">{erro}</div>}

      <div className="table-responsive">
        <table className="table table-sm table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th className="text-end" style={{ width: 160 }}>
                Receitas
              </th>
              <th className="text-end" style={{ width: 160 }}>
                Despesas
              </th>
              <th className="text-end" style={{ width: 160 }}>
                Saldo
              </th>
            </tr>
          </thead>

          <tbody>
            {totais.map((t) => (
              <tr key={t.pessoaId ?? t.pessoa}>
                <td className="fw-semibold">{t.pessoa}</td>
                <td className="text-end">{t.receitas}</td>
                <td className="text-end">{t.despesas}</td>
                <td className="text-end">
                  <span className={`badge ${t.saldo < 0 ? "badge-soft-danger" : "badge-soft-success"}`}>
                    {t.saldo}
                  </span>
                </td>
              </tr>
            ))}

            {totais.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  Nenhum total para exibir.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr className="table-light">
              <td className="fw-bold">TOTAL GERAL</td>
              <td className="text-end fw-bold">{totalGeral.receitas}</td>
              <td className="text-end fw-bold">{totalGeral.despesas}</td>
              <td className="text-end fw-bold">{totalGeral.saldo}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
