using ControleGastos.Api.Data;
using ControleGastos.Api.Models;
using ControleGastos.Api.Enuns;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services
{
    /// <summary>
    /// Serviço responsável por gerenciar Transações.
    /// Todas as validações de regras de negócio (menor de idade, categoria, tipo) são feitas aqui.
    /// </summary>
    public class TransacaoService
    {
        private readonly AppDbContext _context;

        public TransacaoService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Cria uma nova transação.
        /// Valida:
        /// 1. Pessoa existe
        /// 2. Menor de idade só pode registrar despesas
        /// 3. Categoria existe
        /// 4. Tipo da transação compatível com finalidade da categoria
        /// </summary>
        public Transacao Criar(Transacao transacao)
        {
            ValidarTransacao(transacao);

            _context.Transacoes.Add(transacao);
            _context.SaveChanges();
            return transacao;
        }

        /// <summary>
        /// Atualiza uma transação existente.
        /// Reaproveita as mesmas validações do Criar.
        /// </summary>
        public Transacao Atualizar(int id, Transacao transacao)
        {
            var existente = _context.Transacoes.FirstOrDefault(t => t.Id == id);
            if (existente == null)
                throw new Exception("Transação não encontrada");

            // Atualiza campos editáveis
            existente.Descricao = transacao.Descricao;
            existente.Valor = transacao.Valor;
            existente.Tipo = transacao.Tipo;
            existente.PessoaId = transacao.PessoaId;
            existente.CategoriaId = transacao.CategoriaId;

            // Valida regra de negócio antes de salvar
            ValidarTransacao(existente);

            _context.SaveChanges();
            return existente;
        }

        /// <summary>
        /// Exclui uma transação pelo ID.
        /// </summary>
        public void Excluir(int id)
        {
            var existente = _context.Transacoes.FirstOrDefault(t => t.Id == id);
            if (existente == null)
                throw new Exception("Transação não encontrada");

            _context.Transacoes.Remove(existente);
            _context.SaveChanges();
        }

        /// <summary>
        /// Lista todas as transações, incluindo Pessoa e Categoria.
        /// </summary>
        public List<Transacao> Listar()
        {
            return _context.Transacoes
                .Include(t => t.Pessoa)
                .Include(t => t.Categoria)
                .ToList();
        }

        /// <summary>
        /// Centraliza as validações de regra de negócio para Criar/Atualizar.
        /// Assim evitamos duplicação e garantimos consistência.
        /// </summary>
        private void ValidarTransacao(Transacao transacao)
        {
            // 1) Valida pessoa
            var pessoa = _context.Pessoas.Find(transacao.PessoaId);
            if (pessoa == null)
                throw new Exception("Pessoa não encontrada");

            // 2) Menor de idade só pode despesa
            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
                throw new Exception("Menor de idade só pode registrar despesas");

            // 3) Valida categoria
            var categoria = _context.Categorias.Find(transacao.CategoriaId);
            if (categoria == null)
                throw new Exception("Categoria não encontrada");

            // 4) Compatibilidade tipo x finalidade
            // - Se transação é DESPESA, categoria NÃO pode ser RECEITA
            // - Se transação é RECEITA, categoria NÃO pode ser DESPESA
            // - Categoria AMBAS é permitida para os dois casos
            if ((transacao.Tipo == TipoTransacao.Despesa && categoria.Finalidade == FinalidadeCategoria.Receita) ||
                (transacao.Tipo == TipoTransacao.Receita && categoria.Finalidade == FinalidadeCategoria.Despesa))
            {
                throw new Exception("Tipo da transação não compatível com finalidade da categoria");
            }
        }
    }
}
