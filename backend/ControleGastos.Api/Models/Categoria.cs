using ControleGastos.Api.Enuns;
using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models
{
    public class Categoria
    {
        /// <summary>
        /// Identificador único da categoria
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Descrição da categoria
        /// </summary>
        public string Descricao { get; set; } = null!;

        /// <summary>
        /// Finalidade da categoria (Despesa, Receita ou Ambas)
        /// </summary>
        public FinalidadeCategoria Finalidade { get; set; }

        /// <summary>
        /// Propriedade de navegação para EF
        /// </summary>
        [JsonIgnore]
        public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}
