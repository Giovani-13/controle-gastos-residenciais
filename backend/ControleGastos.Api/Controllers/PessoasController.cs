using ControleGastos.Api.Models;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelas rotas de Pessoa.
    /// </summary>
    [ApiController]
    [Route("api/pessoas")]
    public class PessoasController : ControllerBase
    {
        private readonly PessoaService _service;

        public PessoasController(PessoaService service)
        {
            _service = service;
        }

        /// <summary>
        /// Cria uma nova pessoa.
        /// </summary>
        [HttpPost]
        public IActionResult Criar(Pessoa pessoa)
        {
            try
            {
                var result = _service.Criar(pessoa);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Retorna 400 com a mensagem da regra/erro
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Lista todas as pessoas.
        /// </summary>
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_service.Listar());
        }

        /// <summary>
        /// Atualiza uma pessoa pelo ID.
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Pessoa pessoa)
        {
            try
            {
                var result = _service.Atualizar(id, pessoa);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Exclui uma pessoa pelo ID.
        /// Requisito: ao excluir a pessoa, remover as transações associadas.
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
                // Se não achou, retorna 404
                return NotFound(ex.Message);
            }
        }
    }
}
