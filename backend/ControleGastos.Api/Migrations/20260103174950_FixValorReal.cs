using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControleGastos.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixValorReal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Valor",
                table: "Transacao",
                type: "REAL",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
