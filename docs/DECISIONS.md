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

## Fase 1

### F1-01. Colunas e timestamps seguem o spec §15 literalmente

`created_at`/`updated_at` existem nas tabelas em que o spec os lista (clubs, teams, people, player_team_memberships, coach_team_tenures, competitions, competition_editions, venues, matches). Não foram adicionados a `players`, `coaches`, `positions`, `player_positions`, `competition_participants` e `team_seasons`, porque o spec não os define ali. Tabelas de junção usam PK composta, como no spec. Tipos `varchar` ficam sem limite de tamanho, como no spec.

### F1-02. Valores dos enums

O spec só diz "enum". Conjuntos mínimos, porque acrescentar valor depois é fácil (`ALTER TYPE ... ADD VALUE`) e remover não é:

| Enum                 | Valores                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `gender`             | male, female, mixed, unknown                                                   |
| `team_level`         | professional, youth (a faixa etária fica em `age_category`)                    |
| `preferred_foot`     | left, right, both                                                              |
| `position_group`     | goalkeeper, defender, midfielder, forward (pontas contam como forward)         |
| `membership_type`    | permanent, loan, unknown                                                       |
| `competition_scope`  | state, regional, national, continental, world                                  |
| `competition_type`   | league, cup, friendly                                                          |
| `competition_status` | scheduled, ongoing, finished, cancelled                                        |
| `date_precision`     | datetime, day, month, year                                                     |
| `match_status`       | scheduled, live, finished, postponed, suspended, abandoned, cancelled, awarded |

`gender` foi ajustado por decisão do dono do projeto (originalmente só male e female): `mixed` e `unknown` foram acrescentados. Esses dois valores não constam do spec, que só diz `enum` nas linhas 591 e 708. O enum é compartilhado por `teams.gender` e `competitions.gender`. Como a Fase 1 ainda não havia sido commitada nem aplicada em banco compartilhado, a migration `0001` foi regenerada em vez de criar um `ALTER TYPE` numa `0003`.

### F1-03. Nulabilidade e defaults

`NOT NULL` só na identidade e na estrutura: nomes, slugs, FKs de relacionamento e enums. O resto é anulável, porque dados históricos são incompletos (spec §5.2) e um club adversário pode chegar só com o nome. Defaults: `age_category = 'senior'` (times e competições; base usa `U20`, `U17`...), `membership_type = 'permanent'`, `status = 'scheduled'`, `date_precision = 'datetime'`, `is_active = true`. `matches.kickoff_at` é anulável para jogos "a definir".

### F1-04. Índices

O spec só define PKs e `UNIQUE`. O PostgreSQL não indexa FKs sozinho, então foram adicionados índices em toda FK sem índice (`teams.club_id`, colunas de `matches`, memberships, tenures etc.) e em `matches.kickoff_at`, por causa do §47 ("queries indexadas"). Um teste falha se surgir uma FK sem índice.

### F1-05. Constraints além do spec

Todas são checagens de integridade simples: formato de `slug` (`^[a-z0-9]+(-[a-z0-9]+)*$`), código de país ISO alpha-2 em maiúsculas, períodos com fim >= início, óbito >= nascimento, valores positivos (altura, capacidade, `leg`, `seed`, `final_position`), latitude/longitude em faixa, placares não negativos **e sempre em par** (mandante/visitante), e no máximo uma posição principal por jogador (índice único parcial). A regra `home_team_id <> away_team_id` do spec está em `matches_home_away_different_ck`.

### F1-06. FKs com `ON DELETE RESTRICT`

O produto é um acervo histórico: nada deve sumir por cascata. Única exceção: `player_positions.player_id` é `CASCADE` (linhas puramente dependentes do jogador). O nome automático da FK de `competition_participants` passaria de 63 caracteres (limite do PostgreSQL), então essa tabela usa nomes explícitos curtos.

### F1-07. `updated_at` por trigger

`updated_at` é mantido por um trigger `BEFORE UPDATE` (migration custom `0002_updated_at_triggers`), não pelo ORM. Assim vale para SQL manual e para `INSERT ... ON CONFLICT DO UPDATE`, que o `$onUpdate` do Drizzle não cobre e que os imports vão usar. O trigger só dispara se a linha realmente mudou, para que reexecutar um import idempotente não altere `updated_at` (§12.5).

### F1-08. Seed

`npm run db:seed` é idempotente e usa `ON CONFLICT DO NOTHING` nas chaves naturais (`slug`, `code`), então não sobrescreve correções manuais (§12.6). Nenhum ID no código: os UUIDs vêm do banco e as relações são resolvidas por `slug`. Nomes das posições em pt-BR. A data de fundação (1910-09-01) ainda não tem fonte registrada, pois `sources` só chega na Fase 2.

Para executar TypeScript com o alias `@/`, foi adicionada a devDependency `tsx`. É a única dependência nova da fase.

### F1-09. Testes de integração com banco temporário

Cada arquivo de teste cria um banco novo (`hub_fiel_test_<hash>`), aplica as migrations do zero e o apaga no fim. Isso valida "banco novo só pelas migrations" a cada execução e isola os arquivos entre si. O usuário da `DATABASE_URL` precisa de `CREATE DATABASE`, e a URL não deve apontar para produção.

### F1-10. Limitações conhecidas (não resolvidas nesta fase)

Ficam registradas para revisão quando o uso real mostrar necessidade:

- `matches.team_season_id` não é validado contra `home_team_id`/`away_team_id`. Garantir "a temporada é de um dos dois times" exigiria trigger.
- `players.primary_position_id` e a linha `is_primary` de `player_positions` são redundantes e podem divergir.
- Passagens do mesmo jogador (ou técnico) no mesmo time podem se sobrepor no tempo. Bloquear isso exigiria uma exclusion constraint com `btree_gist`.
- `nationality_code`/`birth_country_code` são `char(2)`, como no spec, e não representam Inglaterra, Escócia ou País de Gales (que em ISO 3166-2 são `GB-ENG`, `GB-SCT`, `GB-WLS`).

### F1-11. `drizzle.config.ts` lê só o barrel do schema

`schema` aponta para `./src/db/schema/index.ts`, e não para o diretório. Apontar para o diretório faz o drizzle-kit importar todo `.ts` dali, inclusive os testes de integração que ficam ao lado das tabelas, e `db:generate` quebra. Detectado ao regenerar as migrations do ajuste de `gender`.
