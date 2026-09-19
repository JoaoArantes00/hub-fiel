# IMPLEMENTATION_PLAN.md

## 1. Objetivo deste documento

Este documento define como o projeto deve ser implementado por um agente de desenvolvimento como Claude Code.

Ele não substitui `PROJECT_SPEC.md`.

`PROJECT_SPEC.md` continua sendo a fonte de verdade sobre:

* produto;
* arquitetura;
* domínio;
* schema;
* escopo;
* regras;
* decisões já tomadas.

Este documento define:

* ordem de execução;
* limites por fase;
* entregáveis;
* critérios de aceite;
* checkpoints;
* instruções operacionais para o agente.

---

# 2. Regra principal para o agente

Antes de qualquer implementação:

1. ler `docs/PROJECT_SPEC.md`;
2. ler `docs/IMPLEMENTATION_PLAN.md`;
3. verificar a fase explicitamente solicitada;
4. implementar somente essa fase;
5. não antecipar funcionalidades futuras;
6. não alterar decisões estruturais sem documentar a necessidade;
7. parar ao concluir os critérios de aceite da fase.

O agente não deve interpretar este plano como autorização para implementar o projeto inteiro em uma única execução.

---

# 3. Estratégia de execução

A implementação será incremental.

Fluxo:

```text
Fase
↓
Implementação
↓
Testes
↓
Validação
↓
Correções
↓
Commit/checkpoint
↓
Próxima fase
```

Cada fase deve deixar o repositório em estado funcional.

Nenhuma fase pode depender de código quebrado ou incompleto de uma fase futura.

---

# 4. Regras gerais de engenharia

Durante todas as fases:

* usar TypeScript estrito;
* evitar `any`;
* validar entradas externas com Zod;
* manter migrations reproduzíveis;
* não hardcodar IDs de banco;
* não expor secrets no client;
* manter o domínio independente da API-Football;
* escrever testes para regras importantes;
* manter código simples e explícito;
* evitar abstrações genéricas prematuras;
* não adicionar bibliotecas sem necessidade concreta;
* não criar microsserviços;
* não adicionar Redis;
* não adicionar mecanismo externo de busca;
* não criar autenticação para torcedores;
* não implementar funcionalidades fora da fase atual.

---

# 5. Organização de commits

Sugestão:

```text
feat/foundation
feat/domain-schema
feat/api-football-provider
feat/match-import
feat/public-match-pages
feat/admin
feat/history
feat/records
feat/search
feat/content
```

Commits devem ser pequenos e semanticamente claros.

Exemplo:

```text
feat(db): add clubs and teams schema
feat(import): add API-Football fixtures mapper
test(import): cover fixture idempotency
```

---

# 6. Fase 0 — Fundação técnica

## Objetivo

Criar o esqueleto confiável do projeto.

## Implementar

* Next.js com App Router;
* TypeScript strict;
* Tailwind CSS;
* configuração base de componentes;
* Drizzle ORM;
* PostgreSQL;
* configuração de variáveis de ambiente;
* lint;
* formatter;
* Vitest;
* Playwright;
* GitHub Actions;
* estrutura inicial de pastas;
* README de setup;
* health check simples.

## Estrutura mínima esperada

```text
src/
├── app/
├── modules/
├── integrations/
├── db/
├── jobs/
├── shared/
└── config/
```

## Variáveis esperadas

```text
DATABASE_URL
API_FOOTBALL_KEY
CRON_SECRET
ADMIN_EMAIL
```

Não usar valores reais no repositório.

Criar:

```text
.env.example
```

## Entregáveis

* aplicação sobe localmente;
* conexão com PostgreSQL validada;
* migration vazia ou inicial executável;
* pipeline CI funcional;
* testes de smoke básicos;
* README.

## Critérios de aceite

```text
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

devem passar.

## Não implementar nesta fase

* domínio;
* API-Football;
* páginas reais;
* admin;
* autenticação;
* jobs.

---

# 7. Fase 1 — Schema de domínio

## Objetivo

Implementar a fundação relacional principal.

## Tabelas desta fase

Implementar:

```text
clubs
teams

people
positions
players
coaches
player_positions

player_team_memberships
coach_team_tenures

competitions
competition_editions
competition_participants

team_seasons

venues

matches
```

## Regras obrigatórias

Incluir:

* PKs UUID;
* FKs;
* constraints;
* índices;
* timestamps;
* enums tipados;
* migrations.

## Seed inicial

Criar:

```text
Sport Club Corinthians Paulista

Corinthians Masculino
Corinthians Feminino
Corinthians Sub-20
```

Criar posições:

```text
GK
CB
LB
RB
DM
CM
AM
LW
RW
ST
```

## Testes mínimos

Cobrir:

* Club pode possuir vários Teams;
* jogador pode ter múltiplas passagens;
* mesma pessoa pode ser Player e Coach;
* mandante e visitante não podem ser iguais;
* competição e edição são entidades distintas.

## Critério de aceite

Banco novo deve poder ser criado exclusivamente pelas migrations e seed.

## Não implementar

* eventos;
* estatísticas;
* API-Football;
* frontend final.

---

# 8. Fase 2 — Proveniência e integração externa

## Objetivo

Criar a infraestrutura para receber dados externos sem contaminar o domínio.

## Tabelas

Implementar:

```text
sources
source_references
external_entity_mappings
raw_imports
job_runs
data_conflicts
```

## Criar contrato de provider

Criar interface conceitual:

```ts
interface FootballDataProvider {
  fetchTeams(...)
  fetchPlayers(...)
  fetchFixtures(...)
  fetchMatchEvents(...)
  fetchLineups(...)
  fetchPlayerStats(...)
  fetchTeamStats(...)
}
```

## Criar integração

Estrutura:

```text
src/integrations/api-football/
├── client/
├── schemas/
├── types/
├── mappers/
├── importers/
└── sync/
```

## Regra obrigatória

Nenhum tipo da API-Football pode ser usado diretamente em:

```text
modules/
db/domain-facing code
UI pública
```

## Testes

Cobrir:

* resposta externa inválida falha na validação;
* raw payload é persistido;
* external mapping resolve entidade existente;
* mesmo external ID não cria duplicado.

## Não implementar ainda

* sync completo de partidas;
* eventos;
* lineups;
* UI.

---

# 9. Fase 3 — Importação de fixtures

## Objetivo

Importar partidas do Corinthians de forma idempotente.

## Implementar

* `sync-fixtures`;
* fetch via API-Football;
* validação;
* raw import;
* resolução de competição;
* resolução de times;
* resolução de estádio;
* criação/atualização de partida;
* external mappings;
* `job_runs`.

## Idempotência

Executar o mesmo sync duas vezes deve resultar em:

```text
mesma quantidade de partidas
nenhuma duplicação
mesmos external mappings
```

## Estratégia de resolução

Ordem:

```text
external mapping
→ chave natural confiável
→ conflito
→ criação
```

## Testes obrigatórios

* primeira execução cria partida;
* segunda atualiza, mas não duplica;
* partida alterada externamente atualiza campos permitidos;
* erro do provider não apaga dados existentes;
* conflito ambíguo gera registro em `data_conflicts`.

## Critério de aceite

Deve ser possível popular uma temporada atual do Corinthians via job.

---

# 10. Fase 4 — Eventos, escalações e estatísticas

## Objetivo

Completar a representação factual de uma partida.

## Tabelas

Implementar:

```text
match_events
lineups
lineup_players
player_match_stats
team_match_stats
```

## Job

Criar:

```text
sync-match-details
```

## Importar

* gols;
* cartões;
* substituições;
* escalações;
* formação;
* estatísticas coletivas;
* estatísticas individuais.

## Regras

Eventos devem ser idempotentes.

Quando não houver external event ID, gerar fingerprint com:

```text
match
event type
minute
player
sequence
```

## Testes

* import de gol;
* substituição com `related_player`;
* lineup não duplica;
* stats fazem upsert;
* reexecução não duplica eventos.

---

# 11. Fase 5 — API interna

## Objetivo

Criar contratos estáveis para o frontend e futuras integrações.

## Criar

```text
GET /api/v1/matches
GET /api/v1/matches/:id

GET /api/v1/players
GET /api/v1/players/:slug

GET /api/v1/seasons
GET /api/v1/teams/:teamSlug/seasons/:year

GET /api/v1/competitions
GET /api/v1/competitions/:slug
```

## Convenções

Sucesso:

```json
{
  "data": {},
  "meta": {}
}
```

Erro:

```json
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

## Regras

* validação de query params;
* paginação;
* nenhum stack trace;
* DTOs separados de entidades de persistência.

## Não criar

* API pública irrestrita para tudo;
* endpoints CRUD genéricos.

---

# 12. Fase 6 — Produto público básico

## Objetivo

Entregar a primeira experiência navegável.

## Implementar páginas

```text
/
 /jogos
 /jogos/{id}-{slug}
 /elenco
 /jogadores/{slug}
 /temporadas
 /temporadas/{ano}
```

## Home

Exibir:

* próximo jogo;
* último jogo;
* últimos 5 jogos;
* posição atual, se disponível;
* destaques básicos;
* notícias somente se já houver conteúdo disponível;
* fallback elegante para dados ausentes.

## Página de partida

Exibir:

* competição;
* data;
* estádio;
* placar;
* eventos;
* escalações;
* estatísticas;
* fontes quando disponíveis.

## Elenco

* seletor de equipe;
* agrupamento por posição;
* perfil individual.

## Jogador

* identidade;
* posição;
* passagens;
* números básicos;
* temporadas;
* partidas recentes.

## Temporada

* jogos;
* W/D/L;
* gols;
* competições;
* elenco.

## Critérios

* mobile-first;
* sem erro quando estatística estiver ausente;
* links entre entidades;
* URLs estáveis;
* SEO básico.

---

# 13. Fase 7 — Admin

## Objetivo

Permitir manutenção sem acesso direto ao banco.

## Implementar autenticação simples

Apenas administrador.

## Rotas

```text
/admin
/admin/matches
/admin/players
/admin/competitions
/admin/history
/admin/imports
/admin/jobs
/admin/conflicts
```

## Funcionalidades mínimas

* login;
* logout;
* proteger rotas;
* editar partida;
* editar jogador;
* visualizar jobs;
* disparar job manual;
* visualizar imports;
* resolver conflitos.

## Regra

Jobs manuais devem chamar exatamente os mesmos services dos jobs automáticos.

---

# 14. Fase 8 — História e títulos

## Objetivo

Adicionar primeira camada histórica curada.

## Tabelas

Implementar:

```text
historical_events
historical_event_relations
titles
```

## Páginas

```text
/historia
/historia/titulos
/historia/eventos/{slug}
```

## Admin

Permitir:

* criar evento histórico;
* adicionar descrição;
* informar precisão de data;
* associar jogador;
* associar partida;
* associar temporada;
* adicionar fonte.

## Seed/curadoria inicial

Priorizar temporadas:

```text
2026
2017
2015
2012
2000
1990
1977
```

Não é necessário completar todas nesta fase.

---

# 15. Fase 9 — Agregações e adversários

## Objetivo

Começar a transformar fatos em conhecimento.

## Criar

Materialized views ou camada equivalente para:

```text
player career stats
player season stats
team season stats
head-to-head
```

## Página

```text
/adversarios/{slug}
```

## Exibir

* número de jogos;
* vitórias;
* empates;
* derrotas;
* gols pró;
* gols contra;
* últimos confrontos;
* maior vitória;
* filtros por competição.

## Regra

Agregações nunca são fonte de verdade.

---

# 16. Fase 10 — Recordes

## Objetivo

Criar o primeiro motor de recordes derivados.

## Implementar

```text
mais jogos
maiores artilheiros
maiores vitórias
mais gols em uma temporada
maior sequência invicta
```

## Página

```text
/recordes
```

## Testes obrigatórios

Criar fixtures controladas para validar:

* ranking de artilharia;
* sequência invicta;
* maior goleada;
* desempates documentados.

## Regra

Não hardcodar recordes históricos.

---

# 17. Fase 11 — Busca

## Objetivo

Permitir navegação eficiente no acervo.

## Implementar com PostgreSQL

* full-text search;
* trigram;
* busca sem sensibilidade a acentos.

## Endpoint

```text
GET /api/v1/search?q=
```

## Buscar

* jogadores;
* competições;
* temporadas;
* partidas;
* eventos históricos.

## Página

```text
/buscar
```

## Não adicionar

* Algolia;
* Elasticsearch;
* Meilisearch.

---

# 18. Fase 12 — Notícias e conteúdo

## Objetivo

Adicionar conteúdo contextual.

## Tabelas

```text
content_items
content_relations
```

## Implementar

* ingestão por RSS onde permitido;
* deduplicação;
* fonte;
* data;
* link original;
* thumbnail quando permitido.

## Página

```text
/noticias
```

## Regra editorial

Não copiar matéria integral.

---

# 19. Fase 13 — Feminino

## Objetivo

Validar que a arquitetura realmente suporta outra equipe sem duplicação de sistema.

## Ativar

```text
Corinthians Feminino
```

## Reutilizar

* partidas;
* elenco;
* jogadores;
* competições;
* temporadas;
* recordes.

## Critério

Nenhuma página deve ser duplicada apenas para feminino.

---

# 20. Fase 14 — Base

## Objetivo

Adicionar primeira categoria de base.

Começar por:

```text
Corinthians Sub-20
```

Aplicar a mesma arquitetura.

Não tentar cobrir todas as categorias imediatamente.

---

# 21. Fase 15 — Hardening

## Objetivo

Preparar MVP para uso público.

## Revisar

* erros;
* loading;
* empty states;
* responsividade;
* SEO;
* acessibilidade;
* índices;
* queries lentas;
* rate limiting onde necessário;
* autenticação admin;
* logs;
* backup;
* README;
* documentação de deploy.

## E2E obrigatório

```text
Home → partida → jogador

Temporada → partida

Adversário → partida

Busca → jogador

Admin → login → editar partida

Sync fixtures duas vezes → nenhuma duplicação
```

---

# 22. Critério geral de conclusão

Uma fase só é considerada concluída quando:

1. código implementado;
2. migrations atualizadas;
3. testes passando;
4. lint passando;
5. typecheck passando;
6. build passando;
7. documentação atualizada;
8. nenhum TODO bloqueante daquela fase;
9. critérios de aceite atendidos.

---

# 23. Tratamento de decisões não previstas

Se surgir uma decisão relevante não definida em `PROJECT_SPEC.md`:

## Se reversível e pequena

O agente pode escolher a opção mais simples e documentar em:

```text
docs/DECISIONS.md
```

## Se estrutural

Exemplos:

* trocar ORM;
* alterar modelo de Match;
* trocar PostgreSQL;
* adicionar serviço externo;
* mudar autenticação;
* mudar estratégia de IDs.

O agente deve parar antes da alteração e registrar:

```text
Problema
Opções
Trade-offs
Recomendação
Impacto
```

A decisão deve ser aprovada antes da implementação.

---

# 24. Formato de relatório ao final de cada fase

O agente deve retornar:

```text
FASE CONCLUÍDA
Nome da fase

IMPLEMENTADO
- ...

ARQUIVOS PRINCIPAIS
- ...

MIGRATIONS
- ...

TESTES
- ...

VALIDAÇÕES EXECUTADAS
- lint
- typecheck
- test
- build

DECISÕES TOMADAS
- ...

PENDÊNCIAS
- ...

PRÓXIMA FASE RECOMENDADA
- ...
```

---

# 25. Prompt base para qualquer fase

Usar este template ao iniciar uma fase:

```text
Leia primeiro:

1. docs/PROJECT_SPEC.md
2. docs/IMPLEMENTATION_PLAN.md

Estamos implementando SOMENTE:

FASE [N] — [NOME]

Não implemente fases posteriores.

Antes de alterar código:
- inspecione o repositório;
- identifique o estado atual;
- confirme internamente que as fases anteriores estão atendidas;
- preserve decisões existentes.

Implemente os requisitos e critérios de aceite definidos para esta fase.

Regras:
- mantenha TypeScript strict;
- não use any sem justificativa;
- escreva ou atualize testes;
- mantenha migrations reproduzíveis;
- não exponha secrets;
- não crie abstrações prematuras;
- não adicione serviços externos não especificados;
- não altere arquitetura estrutural silenciosamente.

Ao terminar:
- execute lint;
- execute typecheck;
- execute testes;
- execute build;
- corrija falhas relacionadas à implementação.

Depois forneça o relatório de conclusão conforme definido no IMPLEMENTATION_PLAN.md.
```

---

# 26. Prompt para Fase 0

```text
Leia:

- docs/PROJECT_SPEC.md
- docs/IMPLEMENTATION_PLAN.md

Implemente somente a Fase 0 — Fundação técnica.

Objetivo:
criar uma base Next.js + TypeScript + PostgreSQL + Drizzle confiável para o projeto.

Implemente:

- Next.js com App Router;
- TypeScript strict;
- Tailwind CSS;
- Drizzle ORM;
- conexão PostgreSQL;
- env validation;
- .env.example;
- ESLint;
- formatter;
- Vitest;
- Playwright;
- GitHub Actions;
- estrutura base de pastas;
- README de setup;
- rota de health check.

Ainda não implemente:
- schema de domínio;
- API-Football;
- admin;
- páginas do produto;
- autenticação;
- jobs.

Critérios:
- aplicação sobe localmente;
- banco pode ser conectado;
- lint passa;
- typecheck passa;
- testes passam;
- build passa;
- CI executa essas verificações.

Mantenha a implementação mínima e limpa.
Ao final, gere o relatório da fase.
```

---

# 27. Prompt para Fase 1

```text
Leia:

- docs/PROJECT_SPEC.md
- docs/IMPLEMENTATION_PLAN.md

Implemente somente a Fase 1 — Schema de domínio.

Implemente no PostgreSQL/Drizzle:

clubs
teams
people
positions
players
coaches
player_positions
player_team_memberships
coach_team_tenures
competitions
competition_editions
competition_participants
team_seasons
venues
matches

Inclua:
- UUID PKs;
- timestamps;
- FKs;
- constraints;
- enums;
- índices;
- migrations;
- seed inicial.

Seed:
- Sport Club Corinthians Paulista;
- Corinthians Masculino;
- Corinthians Feminino;
- Corinthians Sub-20;
- posições padrão.

Escreva testes para as regras estruturais indicadas no plano.

Não implemente ainda:
- API-Football;
- eventos;
- lineups;
- stats;
- frontend final.

Ao final execute todas as validações e gere o relatório da fase.
```

---

# 28. Prompt para Fase 2

```text
Leia:

- docs/PROJECT_SPEC.md
- docs/IMPLEMENTATION_PLAN.md

Implemente somente a Fase 2 — Proveniência e integração externa.

Implemente:

sources
source_references
external_entity_mappings
raw_imports
job_runs
data_conflicts

Crie o contrato FootballDataProvider.

Crie a estrutura isolada de integração API-Football.

Implemente:
- client server-side;
- schemas Zod para payloads utilizados;
- raw import persistence;
- external mapping resolution básico.

Não implemente ainda o sync completo de fixtures.

Garanta que nenhum tipo da API-Football seja usado diretamente no domínio ou UI.

Escreva testes para:
- validação;
- persistência de raw import;
- external mapping;
- prevenção de duplicação por external ID.

Ao final execute todas as validações e gere o relatório.
```

---

# 29. Uso recomendado

Não enviar todos os prompts ao agente de uma vez.

Fluxo ideal:

```text
PROJECT_SPEC.md
+
IMPLEMENTATION_PLAN.md
↓
Prompt Fase 0
↓
validar
↓
Prompt Fase 1
↓
validar
↓
Prompt Fase 2
...
```

A especificação permanece no projeto durante toda a execução.

O prompt enviado a cada momento deve mencionar apenas a fase atual.

---

# 30. Regra final

O objetivo não é maximizar quantidade de código por execução.

O objetivo é produzir um sistema:

```text
coerente
testável
fácil de corrigir
fácil de evoluir
confiável nos dados
```

Cada fase deve reduzir risco, não apenas adicionar funcionalidade.
