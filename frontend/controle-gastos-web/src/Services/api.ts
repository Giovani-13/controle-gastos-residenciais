// src/Services/api.ts

/**
 * Camada de acesso à Web API (Back-end).
 *
 * Objetivos desta camada:
 * 1) Centralizar URLs e chamadas HTTP
 * 2) Padronizar tratamento de erros (mostrar mensagem real do back-end)
 * 3) Manter o front desacoplado do fetch/rotas
 */

import {
  Pessoa,
  PessoaInput,
  Categoria,
  CategoriaInput,
  Transacao,
  TransacaoInput,
  TotaisPessoa,
} from '../Types';

/**
 * URL base da API.
 *
 * Recomendado: configurar via .env do Vite
 *  - crie um arquivo ".env" na raiz do front com:
 *      VITE_API_URL=http://localhost:7124/api
 *
 * Assim você não precisa recompilar pra mudar a URL.
 */
const API_URL = 'https://controle-gastos-residenciais.onrender.com/api';

/**
 * Lê a resposta do servidor e lança erro com uma mensagem útil.
 * - Se vier JSON com "message" ou "errors", tentamos exibir.
 * - Se vier texto, exibimos o texto.
 * - Se não vier nada, exibimos status HTTP.
 */
async function parseErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data: any = await res.json();

      // Formatos comuns de erro
      if (typeof data === 'string') return data;
      if (data?.message) return String(data.message);

      // Erros de validação (ex.: ASP.NET ModelState)
      if (data?.errors && typeof data.errors === 'object') {
        const flat = Object.values(data.errors).flat();
        if (flat.length) return flat.join(' | ');
      }

      // fallback
      return JSON.stringify(data);
    }

    // Caso não seja JSON, tenta ler como texto
    const text = await res.text();
    return text?.trim() || `Erro HTTP ${res.status} (${res.statusText})`;
  } catch {
    return `Erro HTTP ${res.status} (${res.statusText})`;
  }
}

/**
 * Executa um fetch e retorna JSON tipado.
 * Se resposta não for OK, lança Error() com mensagem detalhada.
 */
async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new Error(msg);
  }

  // Em endpoints que retornem 204 NoContent, não tente ler json
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

async function requestVoid(input: RequestInfo, init?: RequestInit): Promise<void> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new Error(msg);
  }
  // Não faz res.json() aqui.
}


// ==================== PESSOAS ====================

/**
 * Cria uma pessoa.
 * Endpoint esperado: POST /api/pessoas
 */
export function criarPessoa(p: PessoaInput): Promise<Pessoa> {
  return requestJson<Pessoa>(`${API_URL}/pessoas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
}

/**
 * Lista pessoas.
 * Endpoint esperado: GET /api/pessoas
 */
export function listarPessoas(): Promise<Pessoa[]> {
  return requestJson<Pessoa[]>(`${API_URL}/pessoas`);
}

/**
 * Atualiza pessoa (CRUD completo).
 * Endpoint esperado: PUT /api/pessoas/{id}
 */
export function atualizarPessoa(id: number, p: PessoaInput): Promise<Pessoa> {
  return requestJson<Pessoa>(`${API_URL}/pessoas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
}

/**
 * Deleta pessoa.
 * Requisito: ao deletar pessoa, o back-end deve apagar transações dela.
 * Endpoint esperado: DELETE /api/pessoas/{id}
 */
export function deletarPessoa(id: number): Promise<void> {
  return requestVoid<void>(`${API_URL}/pessoas/${id}`, { method: 'DELETE' });
}

// ==================== CATEGORIAS ====================

/**
 * Cria categoria.
 * Endpoint: POST /api/categorias
 */
export function criarCategoria(c: CategoriaInput): Promise<Categoria> {
  return requestJson<Categoria>(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
}

/**
 * Lista categorias.
 * Endpoint: GET /api/categorias
 */
export function listarCategorias(): Promise<Categoria[]> {
  return requestJson<Categoria[]>(`${API_URL}/categorias`);
}

/**
 * (Opcional) Atualiza categoria.
 * Endpoint: PUT /api/categorias/{id}
 */
export function atualizarCategoria(id: number, c: CategoriaInput): Promise<Categoria> {
  return requestJson<Categoria>(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  });
}

/**
 * (Opcional) Deleta categoria.
 * Endpoint: DELETE /api/categorias/{id}
 */
export function deletarCategoria(id: number): Promise<void> {
  return requestVoid<void>(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
}

// ==================== TRANSAÇÕES ====================

/**
 * Cria transação.
 * Endpoint: POST /api/transacoes
 *
 * Regras esperadas (também no back-end):
 * - menor de 18: só pode "despesa"
 * - categoria deve ser compatível com tipo (finalidade 'ambas' serve para ambos)
 */
export function criarTransacao(t: TransacaoInput): Promise<Transacao> {
  return requestJson<Transacao>(`${API_URL}/transacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(t),
  });
}

/**
 * Lista transações.
 * Endpoint: GET /api/transacoes
 */
export function listarTransacoes(): Promise<Transacao[]> {
  return requestJson<Transacao[]>(`${API_URL}/transacoes`);
}

/**
 * (Opcional) Atualiza transação.
 * Endpoint: PUT /api/transacoes/{id}
 */
export function atualizarTransacao(id: number, t: TransacaoInput): Promise<Transacao> {
  return requestJson<Transacao>(`${API_URL}/transacoes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(t),
  });
}

/**
 * (Opcional) Deleta transação.
 * Endpoint: DELETE /api/transacoes/{id}
 */
export function deletarTransacao(id: number): Promise<void> {
  return requestVoid<void>(`${API_URL}/transacoes/${id}`, { method: 'DELETE' });
}

// ==================== CONSULTAS ====================

/**
 * Totais por pessoa.
 * Endpoint esperado: GET /api/totais-por-pessoa
 *
 * Se a sua rota no back-end for outra, troque aqui.
 */
export function totaisPorPessoa(): Promise<TotaisPessoa[]> {
  return requestJson<TotaisPessoa[]>(`${API_URL}/totais-por-pessoa`);
}
