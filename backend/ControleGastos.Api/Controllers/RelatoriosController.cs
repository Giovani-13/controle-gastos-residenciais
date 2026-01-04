using ControleGastos.Api.Data;
using ControleGastos.Api.Enuns;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers
{
    /// <summary>
    /// Controller responsável por gerar relatórios de Pessoa e Categoria
    /// </summary>
    [ApiController]
    [Route("api/relatorios")]
    public class RelatoriosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatoriosController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retorna totais por pessoa, incluindo total geral
        /// </summary>
        /// <returns>JSON com Detalhes e TotalGeral</returns>
        [HttpGet("pessoas")]
        public IActionResult TotaisPorPessoa()
        {
            // 1) Carrega os dados necessários do banco (uma única vez)
            var pessoas = _context.Pessoas
                .Include(p => p.Transacoes)
                .ToList();

            // 2) Calcula os totais por pessoa em memória (LINQ to Objects)
            var detalhes = pessoas.Select(p =>
            {
                var receitas = p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => t.Valor);

                var despesas = p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => t.Valor);

                return new
                {
                    PessoaId = p.Id,   // ajuda o front a usar key estável
                    Pessoa = p.Nome,
                    Receitas = receitas,
                    Despesas = despesas,
                    Saldo = receitas - despesas
                };
            }).ToList();

            // 3) Total geral (somando os resultados já calculados)
            var totalGeral = new
            {
                TotalReceitas = detalhes.Sum(x => x.Receitas),
                TotalDespesas = detalhes.Sum(x => x.Despesas),
                Saldo = detalhes.Sum(x => x.Saldo)
            };

            return Ok(new { Detalhes = detalhes, TotalGeral = totalGeral });
        }

        /// <summary>
        /// Endpoint de compatibilidade com o front-end.
        /// Retorna apenas a lista (Detalhes), sem o wrapper.
        /// </summary>
        [HttpGet("/api/totais-por-pessoa")]
        public IActionResult TotaisPorPessoaLista()
        {
            // Reaproveita a mesma lógica do método existente
            var obj = TotaisPorPessoa() as OkObjectResult;

            // Se por algum motivo não for OK, devolve lista vazia
            if (obj?.Value == null) return Ok(new List<object>());

            // Extrai a propriedade "Detalhes" do objeto anônimo
            return Ok(((dynamic)obj.Value).Detalhes);
        }

        /// <summary>
        /// Retorna totais por categoria, incluindo total geral
        /// </summary>
        /// <returns>JSON com Detalhes e TotalGeral</returns>
        [HttpGet("categorias")]
        public IActionResult TotaisPorCategoria()
        {
            var resultado = _context.Categorias
                .Include(c => c.Transacoes)
                .Select(c => new
                {
                    Categoria = c.Descricao,
                    Receitas = c.Transacoes
                        .Where(t => t.Tipo == TipoTransacao.Receita)
                        .Sum(t => (decimal?)t.Valor) ?? 0,
                    Despesas = c.Transacoes
                        .Where(t => t.Tipo == TipoTransacao.Despesa)
                        .Sum(t => (decimal?)t.Valor) ?? 0
                })
                .AsEnumerable()
                .Select(x => new
                {
                    x.Categoria,
                    x.Receitas,
                    x.Despesas,
                    Saldo = x.Receitas - x.Despesas
                })
                .ToList();

            var totalGeral = new
            {
                TotalReceitas = resultado.Sum(x => x.Receitas),
                TotalDespesas = resultado.Sum(x => x.Despesas),
                Saldo = resultado.Sum(x => x.Saldo)
            };

            return Ok(new { Detalhes = resultado, TotalGeral = totalGeral });
        }

        [HttpGet("/api/totais-por-categoria")]
        public IActionResult TotaisPorCategoriaLista()
        {
            var obj = TotaisPorCategoria() as OkObjectResult;
            if (obj?.Value == null) return Ok(new List<object>());
            return Ok(((dynamic)obj.Value).Detalhes);
        }
    }
}