using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models
{
    public class Pessoa
    {
        /// <summary>
        /// Identificador único da pessoa (gerado automaticamente)
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Nome da pessoa
        /// </summary>
        public string Nome { get; set; } = null!;

        /// <summary>
        /// Idade da pessoa (valor inteiro positivo)
        /// </summary>
        public int Idade { get; set; }

        /// <summary>
        /// Lista de transações associadas à pessoa
        /// </summary>
        [JsonIgnore]
        public List<Transacao> Transacoes { get; set; } = new();
    }
}
