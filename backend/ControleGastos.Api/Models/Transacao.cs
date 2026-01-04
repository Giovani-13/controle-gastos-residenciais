using ControleGastos.Api.Enuns;

namespace ControleGastos.Api.Models
{
    /// <summary>
    /// Representa uma transação financeira.
    /// </summary>
    public class Transacao
    {
        /// <summary>
        /// Identificador único da transação
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Descrição da transação
        /// </summary>
        public string Descricao { get; set; } = null!;

        /// <summary>
        /// Valor da transação (valor positivo)
        /// </summary>
        public decimal Valor { get; set; }

        /// <summary>
        /// Tipo da transação (Despesa ou Receita)
        /// </summary>
        public TipoTransacao Tipo { get; set; }

        /// <summary>
        /// Pessoa associada à transação
        /// </summary>
        public int PessoaId { get; set; }
        public Pessoa? Pessoa { get; set; }

        /// <summary>
        /// Categoria associada à transação
        /// </summary>
        public int CategoriaId { get; set; }
        public Categoria? Categoria { get; set; }
    }
}
