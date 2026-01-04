using ControleGastos.Api.Models;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelas rotas de Transações.
    /// O TransacaoService contém as regras de negócio (validações).
    /// </summary>
    [ApiController]
    [Route("api/transacoes")]
    public class TransacoesController : ControllerBase
    {
        private readonly TransacaoService _service;

        public TransacoesController(TransacaoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Cria uma nova transação.
        /// </summary>
        [HttpPost]
        public IActionResult Criar(Transacao transacao)
        {
            try
            {
                var result = _service.Criar(transacao);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Retorna 400 com a mensagem de validação/regra
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Lista todas as transações.
        /// </summary>
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_service.Listar());
        }

        /// <summary>
        /// Atualiza uma transação pelo ID.
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Transacao transacao)
        {
            try
            {
                var result = _service.Atualizar(id, transacao);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Exclui uma transação pelo ID.
        /// </summary>
        [HttpDelete("{id}")]
        public IActionResult Excluir(int id)
        {
            try
            {
                _service.Excluir(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
