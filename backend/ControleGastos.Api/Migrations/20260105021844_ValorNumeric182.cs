using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControleGastos.Api.Migrations
{
    /// <inheritdoc />
    public partial class ValorNumeric182 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
		{
			if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
			{
				migrationBuilder.Sql(
					@"ALTER TABLE ""Transacao""
					  ALTER COLUMN ""Valor"" TYPE numeric(18,2)
					  USING round(""Valor""::numeric, 2);"
				);
			}			
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
			{
				migrationBuilder.Sql(
					@"ALTER TABLE ""Transacao""
					  ALTER COLUMN ""Valor"" TYPE real
					  USING ""Valor""::real;"
				);
			}
		}
    }
}
