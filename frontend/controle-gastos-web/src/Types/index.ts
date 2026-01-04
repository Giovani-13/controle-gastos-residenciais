// src/Types/index.ts

/**
 * Tipos do domínio no Front-end.
 * Mantemos estes tipos alinhados ao contrato (JSON) do back-end.
 *
 * Padrão adotado:
 * - enums/strings em minúsculo: "despesa" | "receita" | "ambas"
 * - no POST/PUT o "id" não é enviado; ele é gerado pelo back-end
 */

/** Finalidade de categoria */
export type FinalidadeCategoria = 'despesa' | 'receita' | 'ambas';

/** Tipo de transação */
export type TipoTransacao = 'despesa' | 'receita';

/** Pessoa cadastrada */
export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

/** DTO usado para criar/atualizar pessoa (sem id) */
export type PessoaInput = Omit<Pessoa, 'id'>;

/** Categoria cadastrada */
export interface Categoria {
  id: number;
  descricao: string;
  finalidade: FinalidadeCategoria;
}

/** DTO usado para criar/atualizar categoria (sem id) */
export type CategoriaInput = Omit<Categoria, 'id'>;

/** Transação cadastrada */
export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoriaId: number;
  pessoaId: number;
}

/** DTO usado para criar/atualizar transação (sem id) */
export type TransacaoInput = Omit<Transacao, 'id'>;

/**
 * Totais por pessoa (consulta).
 * Ajuste os nomes caso o seu back retorne campos diferentes.
 */
export interface TotaisPessoa {
  pessoaId: number;
  pessoa: string;
  receitas: number;
  despesas: number;
  saldo: number;
}
