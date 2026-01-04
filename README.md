# Controle de Gastos Residenciais

Este projeto foi desenvolvido como parte de um teste técnico, com o objetivo de implementar
um sistema simples de controle de gastos residenciais, separando back-end e front-end,
seguindo as regras de negócio propostas.

O foco principal foi atender corretamente os requisitos, manter o código organizado
e aplicar boas práticas.

---

## Tecnologias utilizadas

### Back-end
- C#
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQLite (persistência em arquivo)
- Swagger para documentação e testes da API

### Front-end
- React
- TypeScript
- Vite

---

## Estrutura do projeto

- `ControleGastos.Api`  
  Projeto da API REST, responsável pelas regras de negócio e persistência dos dados.

- `controle_gastos.db`  
  Banco de dados SQLite utilizado pela aplicação.

A API foi estruturada separando Controllers, Services, Models, DTOs e Data,
para manter o código mais organizado e fácil de manter.

---
## ▶️ Como rodar o Back-end (API)

### Opção 1 — Usando caminho relativo (a partir da raiz do repositório)

```bash
cd backend/ControleGastos.Api
dotnet restore
dotnet run
```
## Opção 2 Como executar o back-end

1. Clonar o repositório
2. Abrir a solução no Visual Studio 2022
3. Restaurar os pacotes NuGet
4. Executar o projeto `ControleGastos.Api`
5. Acessar o Swagger pelo navegador:

https://localhost:{porta}/swagger


O Swagger pode ser usado para testar todos os endpoints da API.

---

## Funcionalidades implementadas

### Cadastro de pessoas
- Criar pessoa
- Listar pessoas
- Excluir pessoa  

Ao excluir uma pessoa, todas as transações relacionadas a ela também são removidas.

Campos:
- Id (gerado automaticamente)
- Nome
- Idade

---

### Cadastro de categorias
- Criar categoria
- Listar categorias  

Campos:
- Id (gerado automaticamente)
- Descrição
- Finalidade (Despesa, Receita ou Ambas)

---

### Cadastro de transações
- Criar transação
- Listar transações  

Regras de negócio aplicadas:
- Pessoas menores de 18 anos só podem cadastrar despesas
- A categoria deve ser compatível com o tipo da transação
  (ex.: não é permitido usar categoria de receita em uma despesa)

Campos:
- Id (gerado automaticamente)
- Descrição
- Valor (positivo)
- Tipo (Despesa ou Receita)
- Categoria
- Pessoa

---

### Consulta de totais por pessoa
- Lista todas as pessoas
- Exibe total de receitas, despesas e saldo (receita - despesa)
- Exibe também o total geral considerando todas as pessoas

---

## Observações finais

- O banco de dados é persistido em arquivo SQLite, mantendo os dados mesmo após reiniciar a aplicação.
- As regras de negócio foram concentradas na camada de Services.
- O projeto foi desenvolvido priorizando clareza, organização e aderência às regras solicitadas.



