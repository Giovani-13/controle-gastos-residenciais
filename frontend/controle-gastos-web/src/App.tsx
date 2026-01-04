import React, { useEffect, useMemo, useState } from "react";
import PessoaPage from "./Pages/Pessoa";
import CategoriaPage from "./Pages/Categoria";
import TransacoesPage from "./Pages/Transacoes";
import TotaisPessoaPage from "./Pages/TotaisPessoa";
import { API_URL } from "./Services/api";

type Pagina = "pessoas" | "categorias" | "transacoes" | "totais";
type ApiStatus = "waking" | "ready" | "error";

export default function App() {
  const [pagina, setPagina] = useState<Pagina>("pessoas");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("waking");

  // Acorda a API quando o app abre (Render Free pode estar "dormindo")
  useEffect(() => {
    const API_BASE = API_URL.replace(/\/api\/?$/, ""); // remove /api do final, se existir
    let cancelled = false;

    async function wakeApi() {
      setApiStatus("waking");

      const attempts = [0, 1500, 2500, 4000]; // tenta algumas vezes
      for (let i = 0; i < attempts.length; i++) {
        if (cancelled) return;

        if (attempts[i] > 0) {
          await new Promise((r) => setTimeout(r, attempts[i]));
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(`${API_BASE}/health`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (res.ok) {
            if (!cancelled) setApiStatus("ready");
            return;
          }
        } catch {
          // tenta de novo
        }
      }

      if (!cancelled) setApiStatus("error");
    }

    wakeApi();

    return () => {
      cancelled = true;
    };
  }, []);

  const titulo = useMemo(() => {
    if (pagina === "pessoas") return "Pessoas";
    if (pagina === "categorias") return "Categorias";
    if (pagina === "transacoes") return "Transações";
    return "Totais por Pessoa";
  }, [pagina]);

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container py-1">
          <span className="navbar-brand fw-semibold">
            <i className="bi bi-wallet2 me-2" />
            Controle de Gastos
          </span>
          <span className="navbar-text small opacity-75 d-none d-sm-inline">
            Residenciais
          </span>
        </div>
      </nav>

      <main className="container my-4">
        {apiStatus === "error" && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            Não foi possível conectar na API agora. Atualize a página em alguns segundos.
          </div>
        )}

        <div className="p-4 app-hero rounded-4 mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1 fw-bold">{titulo}</h1>
              <div className="text-secondary">
                Cadastre e gerencie pessoas, categorias e transações — com totalização por pessoa.
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn ${pagina === "pessoas" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setPagina("pessoas")}
              >
                <i className="bi bi-people me-2" />
                Pessoas
              </button>
              <button
                type="button"
                className={`btn ${pagina === "categorias" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setPagina("categorias")}
              >
                <i className="bi bi-tags me-2" />
                Categorias
              </button>
              <button
                type="button"
                className={`btn ${pagina === "transacoes" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setPagina("transacoes")}
              >
                <i className="bi bi-arrow-left-right me-2" />
                Transações
              </button>
              <button
                type="button"
                className={`btn ${pagina === "totais" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setPagina("totais")}
              >
                <i className="bi bi-bar-chart-line me-2" />
                Totais
              </button>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            {pagina === "pessoas" && <PessoaPage />}
            {pagina === "categorias" && <CategoriaPage />}
            {pagina === "transacoes" && <TransacoesPage />}
            {pagina === "totais" && <TotaisPessoaPage />}
          </div>
        </div>

        <footer className="text-center text-secondary small py-4">
          <span>Controle de Gastos • Front-end React</span>
        </footer>
      </main>
    </div>
  );
}
