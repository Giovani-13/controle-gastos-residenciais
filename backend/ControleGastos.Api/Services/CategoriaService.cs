using ControleGastos.Api.Data;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services
{
    /// <summary>
    /// Serviço responsável por gerenciar Categorias.
    /// </summary>
    public class CategoriaService
    {
        private readonly AppDbContext _context;

        public CategoriaService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Cria uma nova categoria.
        /// </summary>
        /// <param name="categoria">Objeto Categoria a ser criado</param>
        /// <returns>Categoria criada</returns>
        public Categoria Criar(Categoria categoria)
        {
            _context.Categorias.Add(categoria);
            _context.SaveChanges();
            return categoria;
        }

        /// <summary>
        /// Lista todas as categorias, incluindo transações.
        /// </summary>
        /// <returns>Lista de categorias</returns>
        public List<Categoria> Listar()
        {
            return _context.Categorias
                .Include(c => c.Transacoes)
                .ToList();
        }

        /// <summary>
        /// Atualiza uma categoria existente.
        /// </summary>
        public Categoria Atualizar(int id, Categoria categoria)
        {
            var existente = _context.Categorias.FirstOrDefault(c => c.Id == id);
            if (existente == null)
                throw new Exception("Categoria não encontrada");

            existente.Descricao = categoria.Descricao;
            existente.Finalidade = categoria.Finalidade;

            _context.SaveChanges();
            return existente;
        }

        /// <summary>
        /// Exclui uma categoria.
        /// 
        /// Observação:
        /// - Se existirem transações associadas, removemos antes para não quebrar FK.
        /// - Alternativa: impedir exclusão e exigir que o usuário remova transações primeiro.
        /// </summary>
        public void Excluir(int id)
        {
            var existente = _context.Categorias
                .Include(c => c.Transacoes)
                .FirstOrDefault(c => c.Id == id);

            if (existente == null)
                throw new Exception("Categoria não encontrada");

            // Remove transações relacionadas (evita erro de FK)
            _context.Transacoes.RemoveRange(existente.Transacoes);

            _context.Categorias.Remove(existente);
            _context.SaveChanges();
        }
    }
}
