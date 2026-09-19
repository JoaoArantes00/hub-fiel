# Decisões de implementação

Decisões pequenas e reversíveis tomadas durante a implementação, conforme `docs/IMPLEMENTATION_PLAN.md` §23. Decisões estruturais não entram aqui: exigem aprovação antes.

## Fase 0

### F0-01. TypeScript 6.0, não 7

O `typescript-eslint` (usado por `eslint-config-next`) declara peer `typescript <6.1.0`. TypeScript 7 é a última versão no npm, mas quebra o lint. Fixado em `~6.0.3`. **Revisitar** quando o `typescript-eslint` suportar 7.

### F0-02. ESLint 9, não 10

O `eslint-plugin-react` embutido no `eslint-config-next` 16.3.5 falha com ESLint 10 (`contextOrFilename.getFilename is not a function`). Usa-se ESLint 9, igual ao template oficial do `create-next-app`. O npm avisa que a 9.x está em fim de suporte. **Revisitar** quando o `eslint-config-next` suportar ESLint 10.

### F0-03. Driver `postgres` (postgres.js) com `prepare: false` e `connect_timeout: 5`

- `postgres.js` é um driver simples e bem suportado pelo Drizzle.
- `prepare: false` é necessário para o Transaction pooler do Supabase (infraestrutura inicial, DEC-031) e não prejudica Postgres direto.
- `connect_timeout: 5` evita que o health check trave 30 s (padrão) com o banco fora do ar.

### F0-04. Variáveis de ambiente: só `DATABASE_URL` obrigatória; validação lazy

`API_FOOTBALL_KEY`, `CRON_SECRET` e `ADMIN_EMAIL` são listadas no plano, mas nada as consome na Fase 0. Ficam **opcionais e validadas quando presentes**; cada fase que passar a usá-las deve torná-las obrigatórias. Strings vazias contam como ausentes (por causa do `.env.example`).

A validação roda na primeira chamada de `getEnv()`, não no import. Assim `next build` funciona sem `DATABASE_URL` (verificado). Erros de validação citam o nome da variável, nunca o valor.

### F0-05. Health check em `/api/health` (sem `/v1`)

O `/api/v1` do spec é a API pública de dados. O health check é infraestrutura e não deve ser versionado junto. Segue o envelope do §18 (`{ data, meta }` / `{ error }`), verifica o banco com `SELECT 1` e nunca expõe detalhes de erro.

### F0-06. Migration baseline vazia

Gerada com `drizzle-kit generate --custom --name=baseline`, contendo só comentários. Prova que `db:migrate` é executável e idempotente sem antecipar o schema da Fase 1.

### F0-07. Documentos em `docs/`

O plano cita `docs/PROJECT_SPEC.md`, mas na entrega da Fase 0 os arquivos estavam na raiz. **Resolvido no housekeeping:** `PROJECT_SPEC.md` e `IMPLEMENTATION_PLAN.md` foram movidos para `docs/` sem alteração de conteúdo (mesmo hash do Git antes e depois) e continuam no `.prettierignore` para não serem reformatados.

### F0-08. Sem shadcn/ui e sem `next/font/google` na Fase 0

- "Configuração base de componentes" do plano foi adiada: ainda não há UI, e o spec fala em shadcn/ui "quando útil". `src/shared/` está reservado para os componentes.
- Fontes do sistema: `next/font/google` baixaria arquivos de um serviço externo no build, e tipografia é decisão em aberto (§58).

### F0-09. Nome provisório

O nome oficial do projeto está em aberto (§58). Usa-se `hub-fiel` (nome da pasta) como nome do pacote e "Plataforma Corinthiana" (título do spec) na página provisória. Ambos são fáceis de trocar.

### F0-10. `AGENTS.md` e `CLAUDE.md` gerados pelo `next dev`

O `next dev` do Next 16.3 gera um `AGENTS.md` (bloco gerenciado com um aviso para ler `node_modules/next/dist/docs/`) e um `CLAUDE.md` com `@AGENTS.md`, mas só quando detecta um agente de IA rodando o servidor e o bloco não existe em nenhum dos dois arquivos. Não há opt-out.

**Resolvido no housekeeping:** o `AGENTS.md` foi mantido intacto e versionado (o Next o mantém sozinho; apagá-lo faria o Next recriá-lo). O `CLAUDE.md` passou a ser um arquivo curto do projeto, que aponta `docs/PROJECT_SPEC.md` e `docs/IMPLEMENTATION_PLAN.md` como fontes de verdade e importa o `AGENTS.md` via `@AGENTS.md`. Enquanto o bloco existir no `AGENTS.md`, o Next não altera o `CLAUDE.md`. Nenhuma instrução do bloco conflita com o spec ou o plano.

### F0-11. Ferramentas de teste

- `tsconfig` com `noUncheckedIndexedAccess`, por coerência com a prioridade de integridade dos dados (§59).
- Vitest sem plugin de React/jsdom: a Fase 0 só testa lógica de servidor. O e2e cobre a renderização.
- Playwright com dois projetos (desktop e Pixel 5), porque o produto é mobile-first (§48).
- Testes de integração com banco usam `describe.skipIf(!process.env.DATABASE_URL)`, e o CI sempre define `DATABASE_URL`.
- `vitest.config.mts` (extensão `.mts`) para evitar o aviso de ESM-em-CJS do Vite sem mudar o `package.json` para `"type": "module"`.
