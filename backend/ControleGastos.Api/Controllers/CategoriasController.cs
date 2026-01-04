using ControleGastos.Api.Models;
using ControleGastos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ControleGastos.Api.Controllers
{
    /// <summary>
    /// Controller responsável pelas rotas de Categoria.
    /// Reaproveita o CategoriaService (regras e persistência).
    /// </summary>
    [ApiController]
    [Route("api/categorias")]
    public class CategoriasController : ControllerBase
    {
        private readonly CategoriaService _service;

        public CategoriasController(CategoriaService service)
        {
            _service = service;
        }

        /// <summary>
        /// Cria uma nova categoria.
        /// </summary>
        [HttpPost]
        public IActionResult Criar(Categoria categoria)
        {
            try
            {
                var result = _service.Criar(categoria);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Lista todas as categorias.
        /// </summary>
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_service.Listar());
        }

        /// <summary>
        /// Atualiza uma categoria pelo ID.
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult Atualizar(int id, Categoria categoria)
        {
            try
            {
                var result = _service.Atualizar(id, categoria);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Exclui uma categoria pelo ID.
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
