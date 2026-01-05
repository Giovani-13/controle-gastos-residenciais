using Microsoft.EntityFrameworkCore;
using ControleGastos.Api.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace ControleGastos.Api.Data
{
    /// <summary>
    /// Contexto principal do banco de dados da aplicação.
    /// Responsável por mapear as entidades para as tabelas.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        // Tabelas
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Transacao> Transacoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Mapeia a entidade Transacao para a tabela "Transacao" (singular),
            //modelBuilder.Entity<Pessoa>().ToTable("Pessoa");
            modelBuilder.Entity<Transacao>().ToTable("Transacao");
            modelBuilder.Entity<Categoria>().ToTable("Categoria");


            // Configura os IDs como auto-incrementais
            modelBuilder.Entity<Pessoa>()
                .Property(p => p.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Categoria>()
                .Property(c => c.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Transacao>()
                .Property(t => t.Id)
                .ValueGeneratedOnAdd();


            // Garante que o SQLite armazene decimal como REAL,
            // permitindo SUM/AVG e outros agregados no banco.
            modelBuilder.Entity<Transacao>()
            .Property(t => t.Valor)
            .HasColumnType(Database.IsNpgsql() ? "numeric(18,2)" : "REAL");

            // Ao excluir uma pessoa, excluir automaticamente suas transações
            modelBuilder.Entity<Pessoa>()
                .HasMany(p => p.Transacoes)
                .WithOne(t => t.Pessoa)
                .HasForeignKey(t => t.PessoaId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}