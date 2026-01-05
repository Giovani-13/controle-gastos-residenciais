using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControleGastos.Api.Migrations
{
    public partial class FixValorReal : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Postgres precisa de USING para converter tipo (não faz cast automático)
            if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""Transacao""
                      ALTER COLUMN ""Valor"" TYPE real
                      USING ""Valor""::real;"
                );
            }
            else
            {
                // SQLite (original)
                migrationBuilder.AlterColumn<decimal>(
                    name: "Valor",
                    table: "Transacao",
                    type: "REAL",
                    nullable: false,
                    oldClrType: typeof(decimal),
                    oldType: "TEXT");
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql(
                    @"ALTER TABLE ""Transacao""
                      ALTER COLUMN ""Valor"" TYPE text
                      USING ""Valor""::text;"
                );
            }
            else
            {
                // SQLite (original)
                migrationBuilder.AlterColumn<decimal>(
                    name: "Valor",
                    table: "Transacao",
                    type: "TEXT",
                    nullable: false,
                    oldClrType: typeof(decimal),
                    oldType: "REAL");
            }
        }
    }
}
