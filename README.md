# Plataforma Corinthiana

Acervo digital independente sobre o Sport Club Corinthians Paulista: partidas, jogadores, temporadas, competições e história, navegáveis entre si.

> **Status: Fase 1 (schema de domínio).** Existem a base técnica (Fase 0) e o schema relacional principal: 15 tabelas com migrations e seed inicial. Ainda não há integrações, admin nem páginas reais.

## Documentação de referência

- [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md): fonte de verdade do produto, da arquitetura e do domínio.
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md): ordem de execução, limites e critérios de aceite por fase.
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões pequenas e reversíveis tomadas durante a implementação.

Esses dois primeiros arquivos não devem ser reformatados nem reescritos automaticamente (estão no `.prettierignore`).

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · Zod · Vitest · Playwright · GitHub Actions.

## Pré-requisitos

- **Node.js 20.9 ou superior** (o CI usa Node 22). Confira com `node -v`.
- **Um PostgreSQL acessível** (veja a seção abaixo).

## Setup passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Ter um PostgreSQL

Escolha **uma** das opções.

**Opção A: Supabase (gratuito, é a infraestrutura inicial prevista no projeto)**

1. Crie um projeto em <https://supabase.com>.
2. No painel do projeto, clique em **Connect** (ou **Project Settings → Database**).
3. Copie a **connection string** no formato URI e troque `[YOUR-PASSWORD]` pela senha do banco.
4. Recomendação geral do Supabase (confira na documentação atual; ainda não foi testado contra um projeto Supabase real neste repositório): para rodar migrations prefira a conexão **direta** ou o **Session pooler** (porta 5432). Em produção na Vercel use o **Transaction pooler** (porta 6543). O cliente do app já desativa prepared statements por causa disso.

**Opção B: PostgreSQL local com Docker**

```bash
docker run --name hub-fiel-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hub_fiel -p 5432:5432 -d postgres:17
```

A URL será `postgresql://postgres:postgres@localhost:5432/hub_fiel`. Para parar e religar depois: `docker stop hub-fiel-db` / `docker start hub-fiel-db`.

### 3. Configurar as variáveis de ambiente

```bash
cp .env.example .env.local
```

No Windows (PowerShell): `Copy-Item .env.example .env.local`.

Abra `.env.local` e preencha `DATABASE_URL` com a URL do passo anterior. Nunca commite o `.env.local` (ele já está no `.gitignore`).

| Variável           | Obrigatória na Fase 0 | Descrição                                                     |
| ------------------ | --------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`     | **Sim**               | URL do PostgreSQL (`postgres://` ou `postgresql://`).         |
| `API_FOOTBALL_KEY` | Não                   | Chave da API-Football. Só será usada a partir da Fase 2.      |
| `CRON_SECRET`      | Não                   | Segredo dos crons (mín. 16 caracteres). Usado em fase futura. |
| `ADMIN_EMAIL`      | Não                   | E-mail do administrador. Usado em fase futura.                |

Todas são **server-side**: nenhuma usa o prefixo `NEXT_PUBLIC_`, então nunca vão para o navegador. Se uma variável estiver inválida, a aplicação falha com uma mensagem que cita o **nome** da variável, nunca o valor.

### 4. Aplicar as migrations

```bash
npm run db:migrate
```

São três migrations, aplicadas em ordem: `0000_baseline` (vazia), `0001_domain_schema` (as 15 tabelas, enums, constraints e índices) e `0002_updated_at_triggers` (mantém `updated_at` no banco). Um banco novo e vazio fica pronto só com elas. Rodar o comando de novo é seguro.

### 5. Popular os dados iniciais (seed)

```bash
npm run db:seed
```

Cria o Sport Club Corinthians Paulista, os times Masculino, Feminino e Sub-20, e as 10 posições padrão (GK, CB, LB, RB, DM, CM, AM, LW, RW, ST). É idempotente: rodar de novo não duplica nem sobrescreve nada.

### 6. Subir a aplicação

```bash
npm run dev
```

Abra <http://localhost:3000>. Para conferir a conexão com o banco, abra <http://localhost:3000/api/health>. Deve aparecer:

```json
{ "data": { "status": "ok", "database": "up" }, "meta": {} }
```

Se o banco estiver inacessível ou `DATABASE_URL` inválida, a resposta é `503` com `{ "error": { "code": "DATABASE_UNAVAILABLE", ... } }`. O motivo real aparece só no log do servidor.

## Scripts

| Comando               | O que faz                                                             |
| --------------------- | --------------------------------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento.                                          |
| `npm run build`       | Build de produção (não exige `DATABASE_URL`).                         |
| `npm run start`       | Serve o build de produção.                                            |
| `npm run lint`        | ESLint.                                                               |
| `npm run typecheck`   | Gera os tipos de rota do Next e roda `tsc --noEmit`.                  |
| `npm run format`      | Prettier (escreve). `format:check` só verifica.                       |
| `npm test`            | Vitest (unitários + integração com banco, se `DATABASE_URL` existir). |
| `npm run test:e2e`    | Playwright (desktop e mobile). Precisa de banco e do navegador.       |
| `npm run db:generate` | Gera uma nova migration a partir do schema Drizzle.                   |
| `npm run db:migrate`  | Aplica as migrations pendentes.                                       |
| `npm run db:seed`     | Popula os dados iniciais (idempotente).                               |

## Testes

- **Unitários e de rota** (`src/**/*.test.ts`): rodam sem banco.
- **Integração com PostgreSQL** (`src/db/**/*.integration.test.ts`): só rodam se `DATABASE_URL` estiver definida **no ambiente do shell** (o Vitest não lê `.env.local`). Sem ela aparecem como _skipped_. Cada arquivo cria **um banco temporário próprio** (`hub_fiel_test_<hash>`), aplica as migrations do zero e o apaga no fim; por isso o usuário da `DATABASE_URL` precisa poder executar `CREATE DATABASE`, e ela deve apontar para um PostgreSQL local ou descartável, nunca para produção. Para rodar localmente:
  - macOS/Linux: `DATABASE_URL="postgresql://..." npm test`
  - PowerShell: `$env:DATABASE_URL = "postgresql://..."; npm test`
- **E2E** (`tests/e2e`): antes da primeira execução instale o navegador com `npx playwright install chromium`. Com `CI` definida, o Playwright usa `npm run start` (exige `npm run build` antes); sem `CI`, sobe o `npm run dev` sozinho. O banco precisa estar acessível via `DATABASE_URL` no ambiente do shell.

## CI

O workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) roda a cada push em `main` e em pull requests, com um PostgreSQL efêmero:

`install → lint → typecheck → format:check → db:migrate → test → build → e2e`

O GitHub só lê workflows na **raiz do repositório**. Esta pasta precisa ser a raiz do repositório no GitHub para o CI rodar.

## Estrutura

```text
src/
├── app/            # Next.js App Router (páginas e rotas de API)
├── modules/        # domínio, um módulo por entidade (a partir da Fase 1)
├── integrations/   # provedores externos, ex.: API-Football (a partir da Fase 2)
├── db/             # cliente Drizzle, schema/, migrations/, seed/ e testing/ (helpers de teste)
├── jobs/           # jobs de sincronização (a partir da Fase 3)
├── shared/         # utilitários, validação, erros e componentes compartilhados
└── config/         # configuração e validação de variáveis de ambiente
tests/e2e/          # testes Playwright
```

As subpastas de cada módulo seguem o §11 do `docs/PROJECT_SPEC.md` e são criadas quando a fase correspondente chegar.

## Convenções

- TypeScript strict; `any` é erro de lint.
- IDs internos são UUID; IDs de provedores externos nunca viram IDs internos.
- Não usar valores reais de segredos no repositório.
