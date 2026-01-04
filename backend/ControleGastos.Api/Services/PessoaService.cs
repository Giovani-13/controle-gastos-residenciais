using ControleGastos.Api.Data;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services
{
    /// <summary>
    /// Serviço responsável por gerenciar as operações de Pessoa.
    /// Todas as regras de negócio relacionadas a Pessoa devem ficar aqui.
    /// </summary>
    public class PessoaService
    {
        private readonly AppDbContext _context;

        public PessoaService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Cria uma nova pessoa no banco.
        /// </summary>
        /// <param name="pessoa">Objeto Pessoa a ser criado</param>
        /// <returns>A Pessoa criada com Id gerado</returns>
        public Pessoa Criar(Pessoa pessoa)
        {
            _context.Pessoas.Add(pessoa);
            _context.SaveChanges();
            return pessoa;
        }

        /// <summary>
        /// Lista todas as pessoas cadastradas, incluindo suas transações.
        /// </summary>
        /// <returns>Lista de pessoas</returns>
        public List<Pessoa> Listar()
        {
            return _context.Pessoas
                .Include(p => p.Transacoes) // garante que as transações sejam carregadas
                .ToList();
        }

        /// <summary>
        /// Atualiza uma pessoa pelo Id.
        /// </summary>
        /// <param name="id">Id da pessoa</param>
        /// <param name="pessoa">Dados atualizados (Nome/Idade)</param>
        /// <returns>Pessoa atualizada</returns>
        public Pessoa Atualizar(int id, Pessoa pessoa)
        {
            // Busca a pessoa existente
            var existente = _context.Pessoas.FirstOrDefault(p => p.Id == id);
            if (existente == null)
                throw new Exception("Pessoa não encontrada");

            // Atualiza campos editáveis
            existente.Nome = pessoa.Nome;
            existente.Idade = pessoa.Idade;

            _context.SaveChanges();
            return existente;
        }

        /// <summary>
        /// Exclui uma pessoa pelo Id.
        /// Ao excluir, também remove todas as transações associadas.
        /// </summary>
        /// <param name="id">Id da pessoa a ser excluída</param>
        public void Excluir(int id)
        {
            var pessoa = _context.Pessoas
                .Include(p => p.Transacoes)
                .FirstOrDefault(p => p.Id == id);

            if (pessoa == null)
                throw new Exception("Pessoa não encontrada");

            // Remove todas as transações da pessoa
            _context.Transacoes.RemoveRange(pessoa.Transacoes);

            _context.Pessoas.Remove(pessoa);
            _context.SaveChanges();
        }
    }
}
