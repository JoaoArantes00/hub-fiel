# Handoff Mestre — Plataforma Corinthiana

## 1. Objetivo do projeto

Construir uma plataforma web gratuita e independente, voltada ao torcedor do Sport Club Corinthians Paulista, capaz de centralizar e relacionar informações atuais e históricas do clube.

O produto deve funcionar como uma base viva de conhecimento sobre o Corinthians, cobrindo inicialmente o futebol masculino profissional e sendo arquitetado desde o início para suportar:

* futebol feminino;
* categorias de base;
* temporadas históricas;
* partidas;
* jogadores;
* técnicos;
* competições;
* estatísticas;
* títulos;
* recordes;
* tabus;
* adversários;
* eventos históricos;
* notícias;
* conteúdo autoral futuro;
* informações institucionais e financeiras em fases posteriores.

O produto não deve ser tratado como um portal tradicional de notícias.

O diferencial central deve ser a capacidade de navegar entre entidades relacionadas e explorar o Corinthians de forma histórica e contextual.

---

# 2. Visão do produto

A proposta é construir um acervo digital independente sobre o Corinthians, reunindo presente, passado, estatísticas, contexto e conteúdo em uma experiência própria.

Exemplo de jornada desejada:

```text
Home
↓
próximo Corinthians x Palmeiras
↓
página da partida
↓
histórico do confronto
↓
partida de 1999
↓
temporada 1999
↓
elenco
↓
perfil de jogador
↓
recordes relacionados
```

A aplicação deve funcionar como uma rede de conhecimento, não como um conjunto de páginas isoladas.

---

# 3. Perfil do projeto

O projeto é:

* pessoal;
* gratuito;
* sem objetivo comercial inicial;
* web-first;
* mobile responsive;
* orientado a dados;
* orientado a histórico;
* com possibilidade de expansão futura.

Não existe decisão atual sobre aplicativo nativo.

A arquitetura deve permitir que um cliente mobile seja adicionado posteriormente sem reconstruir o backend.

---

# 4. Público principal

O produto deve atender principalmente o torcedor apaixonado pelo Corinthians.

Deve continuar sendo simples o suficiente para um torcedor casual e oferecer profundidade suficiente para usuários interessados em estatísticas e história.

Perfil principal:

```text
torcedor apaixonado
+
interesse em história
+
estatísticas
+
partidas
+
elenco
+
curiosidades
+
recordes
```

---

# 5. Princípios de produto

## 5.1. Entidades navegáveis

Todo objeto importante deve preferencialmente ser uma entidade navegável.

Exemplos:

* jogador;
* técnico;
* partida;
* temporada;
* competição;
* adversário;
* estádio;
* título;
* evento histórico.

Evitar informações relevantes armazenadas apenas como texto editorial quando puderem existir como dado estruturado.

---

## 5.2. Histórico como parte central

A arquitetura não deve tratar histórico como funcionalidade secundária.

Deve ser possível armazenar dados desde as primeiras décadas do clube.

Entretanto, o preenchimento do acervo será progressivo.

O MVP não precisa possuir toda a história desde 1910.

---

## 5.3. Fonte e proveniência

Dados relevantes devem suportar identificação da origem.

Exemplos:

```text
API-Football
CBF
CONMEBOL
Corinthians
fontes jornalísticas
livros
arquivos históricos
inserção manual
```

Quando fontes divergirem, a arquitetura deve permitir registrar o conflito.

---

## 5.4. Dados factuais versus dados derivados

Separar explicitamente:

```text
FATOS
partidas
eventos
jogadores
escalações
gols
```

de:

```text
DERIVAÇÕES
artilharia
aproveitamento
sequências
recordes
tabus
```

Dados derivados devem ser recalculáveis.

---

# 6. Escopo do MVP

O MVP público deve conter:

* Home;
* Jogos;
* Página da partida;
* Elenco;
* Perfil de jogador;
* Temporadas;
* Página da temporada;
* Competições;
* Página de adversário;
* História básica;
* Títulos;
* Recordes básicos;
* Notícias agregadas;
* Busca global;
* Painel administrativo.

---

# 7. Fora do MVP

Não implementar nesta primeira versão:

* contas para torcedores;
* favoritos;
* comentários;
* fórum;
* rede social;
* fantasy game;
* gamificação;
* notificações push;
* aplicativo nativo;
* monetização;
* assinaturas;
* chat com IA;
* livescore de alta frequência;
* streaming;
* estatísticas proprietárias avançadas;
* motor tático avançado;
* xG próprio;
* painel financeiro completo;
* cobertura integral de todas as categorias de base;
* toda a história do clube desde 1910.

Essas funcionalidades não devem contaminar a arquitetura do MVP com complexidade prematura.

---

# 8. Equipes suportadas

A modelagem deve suportar desde o primeiro dia:

```text
Corinthians masculino profissional
Corinthians feminino profissional
Corinthians masculino Sub-20
Corinthians masculino Sub-17
outras categorias futuras
```

Club e Team são entidades distintas.

Exemplo:

```text
Club
Sport Club Corinthians Paulista

Teams
├── Corinthians Masculino
├── Corinthians Feminino
├── Corinthians Sub-20
└── Corinthians Sub-17
```

---

# 9. Stack técnica

Utilizar:

```text
Frontend + backend:
Next.js + TypeScript

Banco:
PostgreSQL

ORM:
Drizzle ORM

CSS:
Tailwind CSS

Componentes:
shadcn/ui como base quando útil

Validação:
Zod

Testes:
Vitest
Playwright

Deploy:
Vercel

PostgreSQL inicial:
Supabase

CI:
GitHub Actions
```

---

# 10. Arquitetura

Utilizar um monólito modular.

Não criar microsserviços no MVP.

Arquitetura conceitual:

```text
                      API-Football
                           │
                           │ sync
                           ▼
                    Import / Normalize
                           │
                           ▼
                       PostgreSQL
                           │
                ┌──────────┴──────────┐
                │                     │
             Next.js               Admin
                │
                ▼
              Web
```

A aplicação Next.js deve conter:

```text
web pública
backend
API
admin
jobs
```

sem impedir futura separação.

---

# 11. Estrutura sugerida do repositório

```text
src/
├── app/
│
├── modules/
│   ├── clubs/
│   ├── teams/
│   ├── people/
│   ├── players/
│   ├── coaches/
│   ├── matches/
│   ├── competitions/
│   ├── seasons/
│   ├── statistics/
│   ├── records/
│   ├── history/
│   ├── content/
│   └── sources/
│
├── integrations/
│   └── api-football/
│       ├── client/
│       ├── types/
│       ├── mappers/
│       ├── importers/
│       └── sync/
│
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── repositories/
│   └── queries/
│
├── jobs/
│
├── admin/
│
├── shared/
│   ├── components/
│   ├── validation/
│   ├── errors/
│   └── utils/
│
└── config/
```

Não é necessário aplicar DDD acadêmico completo.

Priorizar separação clara de responsabilidades.

---

# 12. Regras arquiteturais obrigatórias

## 12.1.

API-Football nunca deve ser chamada diretamente pelo navegador.

Errado:

```text
Browser
↓
API-Football
```

Correto:

```text
API-Football
↓
importação
↓
PostgreSQL
↓
aplicação
```

---

## 12.2.

Tipos e estruturas da API-Football não podem contaminar o domínio interno.

Fluxo:

```text
API DTO
↓
mapper
↓
normalized DTO
↓
resolver
↓
domain model
↓
database
```

---

## 12.3.

IDs externos nunca serão IDs internos.

Usar UUIDs internos e uma tabela de mapeamento externo.

---

## 12.4.

O banco PostgreSQL é a fonte de verdade da aplicação.

API-Football é apenas uma fonte externa.

---

## 12.5.

Toda importação precisa ser idempotente.

Executar o mesmo import duas vezes não pode duplicar entidades.

---

## 12.6.

Dados históricos manualmente verificados não devem ser sobrescritos silenciosamente por imports externos.

---

# 13. Modelo de domínio principal

Entidades:

```text
Club
Team

Person
Player
Coach
Position

PlayerTeamMembership
CoachTeamTenure

Competition
CompetitionEdition
CompetitionParticipant

TeamSeason

Venue

Match
MatchEvent

Lineup
LineupPlayer

PlayerMatchStats
TeamMatchStats

HistoricalEvent
Title

ContentItem
ContentRelation

Source
SourceReference

ExternalEntityMapping
RawImport

JobRun
DataConflict
```

---

# 14. Relações conceituais

```text
Club
 └── Team
      ├── TeamSeason
      ├── PlayerTeamMembership
      ├── CoachTeamTenure
      └── Match

Person
 ├── Player
 └── Coach

Competition
 └── CompetitionEdition
      ├── CompetitionParticipant
      └── Match

Match
 ├── MatchEvent
 ├── Lineup
 ├── PlayerMatchStats
 └── TeamMatchStats
```

---

# 15. Schema físico

## clubs

```text
id uuid PK
name varchar
full_name varchar
short_name varchar
slug varchar UNIQUE
founded_on date
city varchar
state varchar
country_code char(2)
crest_url text
is_active boolean
created_at
updated_at
```

---

## teams

```text
id uuid PK
club_id FK clubs
name varchar
slug varchar UNIQUE
gender enum
age_category varchar
level enum
is_active boolean
created_at
updated_at
```

---

## people

```text
id uuid PK
full_name varchar
known_name varchar
slug varchar UNIQUE
birth_date date
death_date date
birth_city varchar
birth_country_code char(2)
nationality_code char(2)
height_cm smallint
preferred_foot enum
photo_url text
created_at
updated_at
```

---

## players

```text
id uuid PK
person_id FK people UNIQUE
primary_position_id FK positions
```

---

## coaches

```text
id uuid PK
person_id FK people UNIQUE
```

---

## positions

```text
id uuid PK
code varchar UNIQUE
name varchar
group_name enum
sort_order smallint
```

---

## player_positions

```text
player_id FK players
position_id FK positions
is_primary boolean

PK(player_id, position_id)
```

---

## player_team_memberships

```text
id uuid PK
player_id FK players
team_id FK teams
started_on date
ended_on date
shirt_number varchar
membership_type enum
notes text
created_at
updated_at
```

---

## coach_team_tenures

```text
id uuid PK
coach_id FK coaches
team_id FK teams
started_on date
ended_on date
role varchar
created_at
updated_at
```

---

## competitions

```text
id uuid PK
name varchar
short_name varchar
slug varchar UNIQUE
organizer varchar
country_code char(2)
scope enum
competition_type enum
gender enum
age_category varchar
created_at
updated_at
```

---

## competition_editions

```text
id uuid PK
competition_id FK competitions
season_label varchar
slug varchar UNIQUE
starts_on date
ends_on date
format varchar
status enum
created_at
updated_at

UNIQUE(competition_id, season_label)
```

---

## competition_participants

```text
competition_edition_id FK
team_id FK
group_name varchar
seed smallint
final_position smallint
status varchar

PK(competition_edition_id, team_id)
```

---

## team_seasons

```text
id uuid PK
team_id FK teams
year smallint
label varchar
starts_on date
ends_on date

UNIQUE(team_id, year)
```

---

## venues

```text
id uuid PK
name varchar
slug varchar UNIQUE
city varchar
state varchar
country_code char(2)
capacity integer
latitude numeric
longitude numeric
created_at
updated_at
```

---

## matches

```text
id uuid PK
competition_edition_id FK competition_editions
team_season_id FK team_seasons nullable
stage varchar
round varchar
leg smallint

kickoff_at timestamptz
date_precision enum

venue_id FK venues

home_team_id FK teams
away_team_id FK teams

status enum

home_score_regular smallint
away_score_regular smallint

home_score_extra_time smallint
away_score_extra_time smallint

home_score_penalties smallint
away_score_penalties smallint

attendance integer
referee_name varchar
notes text

created_at
updated_at
```

Constraint:

```text
home_team_id != away_team_id
```

---

## match_events

```text
id uuid PK
match_id FK matches
team_id FK teams
player_id FK players nullable
related_player_id FK players nullable
event_type enum
period enum
minute smallint
added_time smallint
sequence smallint
detail varchar
metadata jsonb
created_at
updated_at
```

---

## lineups

```text
id uuid PK
match_id FK matches
team_id FK teams
coach_id FK coaches nullable
formation varchar
created_at
updated_at

UNIQUE(match_id, team_id)
```

---

## lineup_players

```text
lineup_id FK lineups
player_id FK players
position_id FK positions nullable
shirt_number varchar
is_starter boolean
is_captain boolean
grid_position varchar
sort_order smallint

PK(lineup_id, player_id)
```

---

## player_match_stats

```text
match_id FK matches
player_id FK players
team_id FK teams

minutes_played
goals
assists

shots
shots_on_target

passes_attempted
passes_completed

key_passes
tackles
interceptions
clearances
saves

yellow_cards
red_cards

rating

metadata jsonb

created_at
updated_at

PK(match_id, player_id)
```

---

## team_match_stats

```text
match_id FK matches
team_id FK teams

possession_pct
shots
shots_on_target
corners
fouls
offsides

passes_attempted
passes_completed

yellow_cards
red_cards

metadata jsonb

created_at
updated_at

PK(match_id, team_id)
```

---

## historical_events

```text
id uuid PK
title varchar
slug varchar UNIQUE
description text
event_date date
date_precision enum
category enum
created_at
updated_at
```

---

## historical_event_relations

```text
historical_event_id FK
entity_type varchar
entity_id uuid
relation_type varchar
```

---

## titles

```text
id uuid PK
team_id FK teams
competition_edition_id FK competition_editions
won_on date
classification varchar
notes text

UNIQUE(team_id, competition_edition_id)
```

---

## content_items

```text
id uuid PK
type enum
title varchar
description text
publisher varchar
external_url text
thumbnail_url text
published_at timestamptz
is_featured boolean
created_at
updated_at
```

---

## content_relations

```text
content_id FK
entity_type varchar
entity_id uuid
relation_type varchar
```

---

## sources

```text
id uuid PK
name varchar
type enum
homepage_url text
reliability_notes text
is_active boolean
created_at
updated_at
```

---

## source_references

```text
id uuid PK
source_id FK
entity_type varchar
entity_id uuid
source_url text
external_id varchar
retrieved_at timestamptz
notes text
created_at
updated_at
```

---

## external_entity_mappings

```text
id uuid PK
provider varchar
entity_type varchar
entity_id uuid
external_id varchar
metadata jsonb
created_at
updated_at

UNIQUE(provider, entity_type, external_id)
```

---

## raw_imports

```text
id uuid PK
provider varchar
resource_type varchar
external_id varchar
request_key varchar
payload jsonb
checksum varchar
received_at timestamptz
processed_at timestamptz
status enum
error_message text
created_at
updated_at
```

---

## job_runs

```text
id uuid PK
job_name varchar
job_key varchar
started_at timestamptz
finished_at timestamptz
status enum
items_received integer
items_processed integer
items_failed integer
error_summary text
metadata jsonb
```

---

## data_conflicts

```text
id uuid PK
entity_type varchar
entity_id uuid
field_name varchar
source_a_id FK sources
source_b_id FK sources
value_a jsonb
value_b jsonb
status enum
resolution jsonb
resolved_at timestamptz
created_at
updated_at
```

---

# 16. Dados agregados

Não armazenar dados agregados como fonte principal quando puderem ser derivados.

Criar materialized views conforme necessário:

```text
mv_player_career_stats
mv_player_season_stats
mv_team_season_stats
mv_head_to_head_stats
mv_player_vs_opponent_stats
mv_competition_team_stats
```

Atualizar após imports relevantes e em job periódico.

---

# 17. API pública

Versionar como:

```text
/api/v1
```

Principais endpoints:

```text
GET /api/v1/matches
GET /api/v1/matches/:id

GET /api/v1/players
GET /api/v1/players/:slug
GET /api/v1/players/:id/matches

GET /api/v1/seasons
GET /api/v1/teams/:teamSlug/seasons/:year

GET /api/v1/competitions
GET /api/v1/competitions/:slug

GET /api/v1/opponents/:teamSlug

GET /api/v1/records

GET /api/v1/search

GET /api/v1/content
```

---

# 18. Formato de resposta

Sucesso:

```json
{
  "data": {},
  "meta": {}
}
```

Lista:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

Erro:

```json
{
  "error": {
    "code": "MATCH_NOT_FOUND",
    "message": "Partida não encontrada"
  }
}
```

Não expor stack traces.

---

# 19. Integração API-Football

Criar provider isolado:

```text
integrations/api-football/
```

Contrato conceitual:

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

A camada de domínio não deve importar tipos específicos da API-Football.

---

# 20. Pipeline de ingestão

Fluxo obrigatório:

```text
API-Football
↓
RawImport
↓
Validation
↓
Mapper
↓
Normalized DTO
↓
Resolver
↓
Persistence
↓
ExternalEntityMapping
```

---

# 21. Resolução de entidades

Ordem:

```text
1. procurar external mapping;
2. se existir, usar entidade correspondente;
3. se não existir, tentar chave natural;
4. se correspondência inequívoca, criar mapping;
5. se ambígua, registrar conflito;
6. se inexistente, criar entidade.
```

---

# 22. Idempotência

Toda sincronização deve poder ser executada novamente sem duplicar:

* partidas;
* jogadores;
* times;
* eventos;
* escalações;
* estatísticas.

---

# 23. Jobs

Implementar:

```text
sync-fixtures
sync-match-details
sync-squads
sync-players
sync-standings
refresh-aggregates
discover-records
sync-news
```

---

# 24. `sync-fixtures`

Responsável por:

```text
partidas futuras
partidas recentes
status
placar
competição
estádio
```

Fluxo:

```text
fetch
↓
raw import
↓
validate
↓
resolve entities
↓
upsert match
↓
mapping
```

---

# 25. `sync-match-details`

Responsável por:

```text
eventos
escalações
estatísticas
jogadores da partida
```

Executar prioritariamente após partidas.

---

# 26. `sync-squads`

Não apagar passagens antigas quando um atleta desaparecer do elenco.

Membership histórico deve ser preservado.

---

# 27. `refresh-aggregates`

Atualizar:

```text
player career stats
player season stats
team season stats
head-to-head
```

Falha desse job não deve invalidar dados factuais já importados.

---

# 28. Retry policy

Para provedores externos:

```text
429 → retry com backoff
5xx → retry
timeout → retry
4xx permanente → não repetir indefinidamente
```

Máximo inicial:

```text
3 tentativas
```

---

# 29. Lock de jobs

Não permitir execuções simultâneas equivalentes.

Exemplo de chave:

```text
sync-fixtures:corinthians:2026-09
```

---

# 30. Admin

Rota:

```text
/admin
```

Acesso somente autenticado.

Módulos:

```text
Dashboard

Dados
├── Times
├── Jogadores
├── Competições
├── Temporadas
├── Partidas
└── Estádios

História
├── Eventos
├── Títulos
└── Fontes

Conteúdo
├── Notícias
└── Vídeos

Integrações
├── API-Football
├── Jobs
└── Imports

Qualidade
├── Conflitos
├── Duplicados
└── Dados incompletos
```

---

# 31. Busca

Começar usando PostgreSQL.

Suportar:

```text
full-text search
trigram
accent-insensitive search
```

Não usar Algolia, Elasticsearch ou Meilisearch no MVP.

---

# 32. Cache

Utilizar inicialmente recursos nativos de cache/revalidation do Next.js e CDN.

Não adicionar Redis sem necessidade concreta.

---

# 33. Navegação principal

Menu público inicial:

```text
Home
Jogos
Elenco
Temporadas
História
Recordes
Notícias
Busca
```

---

# 34. Rotas públicas

```text
/

/jogos
/jogos/{id}-{slug}

/elenco

/jogadores
/jogadores/{slug}

/temporadas
/temporadas/{ano}

/competicoes
/competicoes/{slug}

/adversarios
/adversarios/{slug}

/historia
/historia/titulos
/historia/eventos/{slug}

/recordes

/noticias

/buscar
```

---

# 35. Home

Exibir:

```text
próximo jogo
último jogo
últimos 5 resultados
posição atual
destaques individuais
notícias
conteúdo histórico
curiosidade/recorde
```

A home representa o presente do clube.

---

# 36. Página de partida

Seções:

```text
Resumo
Escalação
Estatísticas
Eventos
Histórico do confronto
Conteúdo relacionado
Fontes
```

Tratar ausência de dados normalmente.

Não exibir blocos quebrados porque uma competição antiga não possui determinada estatística.

---

# 37. Perfil do jogador

Exibir:

```text
dados pessoais
posição
passagens
temporada atual
estatísticas históricas
temporadas
títulos
partidas recentes
recordes relacionados
conteúdo relacionado
```

---

# 38. Página de temporada

É um dos hubs centrais do produto.

Exibir:

```text
temporada
jogos
vitórias
empates
derrotas
gols pró
gols contra
títulos
competições
elenco
artilheiros
técnicos
partidas
recordes
eventos históricos
conteúdo relacionado
```

---

# 39. Página de adversário

Exibir:

```text
jogos
vitórias
empates
derrotas
gols pró
gols contra
últimos confrontos
maior vitória
sequências
artilheiros do confronto
```

Permitir filtro por competição.

---

# 40. Recordes iniciais

Implementar primeiro:

```text
mais jogos pelo Corinthians
maiores artilheiros
maiores vitórias
mais gols em uma temporada
maior sequência invicta
```

Calcular usando dados factuais.

---

# 41. Notícias

Tratar notícias como complemento, não como núcleo da experiência.

Persistir:

```text
título
fonte
URL
imagem quando permitida
published_at
```

Não republicar texto integral de terceiros.

---

# 42. Conteúdo autoral futuro

Preparar `ContentItem` e relações para futuramente conectar:

```text
Instagram
YouTube
artigos próprios
vídeos
```

a:

```text
jogadores
partidas
temporadas
competições
eventos históricos
```

---

# 43. Segurança

Obrigatório:

```text
API-Football key server-side
DATABASE_URL server-side
/admin protegido
cron autenticado
inputs validados com Zod
SQL parametrizado
sem stack traces públicos
```

---

# 44. Observabilidade

Todo job deve registrar:

```text
início
fim
status
itens recebidos
itens processados
itens com erro
resumo do erro
```

---

# 45. Testes

## Unitários

Cobrir principalmente:

```text
mappers
normalizadores
recordes
sequências
regras de domínio
```

## Integração

Cobrir:

```text
repositories
queries
importadores
idempotência
```

## E2E

Fluxos obrigatórios:

```text
Home → partida → jogador

Temporada → partida

Adversário → confronto

Busca → jogador

Admin → login → editar partida

Executar import duas vezes → nenhuma duplicação
```

---

# 46. CI

GitHub Actions:

```text
install
↓
lint
↓
typecheck
↓
unit/integration tests
↓
build
```

Nenhum deploy de produção deve ocorrer com pipeline quebrado.

---

# 47. Performance

Objetivos:

```text
server rendering quando apropriado
cache em páginas públicas
sem dependência da API-Football em request público
queries indexadas
paginação para listas grandes
```

Evitar otimizações prematuras.

---

# 48. Responsividade

Design mobile-first.

A experiência principal precisa funcionar muito bem em celulares.

Desktop deve usar o espaço adicional sem alterar a lógica principal de navegação.

---

# 49. Acessibilidade

Mínimo obrigatório:

```text
HTML semântico
contraste adequado
navegação por teclado
foco visível
labels
alt text
```

---

# 50. Seed inicial

Criar seed para:

```text
Sport Club Corinthians Paulista

Corinthians Masculino
Corinthians Feminino
Corinthians Sub-20

posições padrão

fonte API-Football

principais competições utilizadas no desenvolvimento
```

Não hardcode IDs no código.

---

# 51. Temporadas históricas iniciais

Para validar diferentes períodos, iniciar com subconjunto progressivo.

Sugestão:

```text
2026
2017
2015
2012
2000
1990
1977
```

Não é necessário preencher todas antes do lançamento técnico.

---

# 52. Backlog por fases

## Fase 0 — Fundação

Implementar:

```text
Next.js
TypeScript
Tailwind
Drizzle
PostgreSQL
env validation
CI
deploy
README
```

---

## Fase 1 — Schema e domínio

Implementar:

```text
Club
Team
Person
Player
Coach
Position
Membership
Competition
CompetitionEdition
TeamSeason
Venue
Match
```

Criar migrations e seeds.

---

## Fase 2 — Integração

Implementar:

```text
API-Football client
provider interface
raw imports
external mappings
fixtures importer
entity resolution
job runs
```

Critério:

Executar import de fixtures duas vezes não gera duplicação.

---

## Fase 3 — Detalhes de partidas

Implementar:

```text
lineups
events
player stats
team stats
match detail sync
```

---

## Fase 4 — Produto público básico

Implementar:

```text
Home
Jogos
Página da partida
Elenco
Jogador
Temporadas
```

---

## Fase 5 — Admin

Implementar:

```text
auth
dashboard
CRUD básico
jobs
imports
conflitos
```

---

## Fase 6 — Histórico

Implementar:

```text
historical events
titles
sources
season history
manual historical data
```

---

## Fase 7 — Inteligência

Implementar:

```text
materialized views
player aggregates
team aggregates
head-to-head
opponents
records
streaks
```

---

## Fase 8 — Busca

Implementar busca PostgreSQL.

---

## Fase 9 — Conteúdo

Implementar:

```text
news
RSS quando disponível
content relations
```

---

## Fase 10 — Expansão

Ativar progressivamente:

```text
feminino
Sub-20
outras categorias
```

sem duplicar arquitetura ou componentes.

---

# 53. Critério de conclusão do MVP

O MVP será considerado concluído quando um torcedor puder:

```text
abrir a home
ver próximo e último jogo
consultar calendário
abrir partida
consultar elenco
abrir jogador
explorar temporadas
consultar títulos
consultar retrospectos
ver recordes básicos
buscar no acervo
ver notícias
```

E o administrador puder:

```text
sincronizar dados
monitorar jobs
corrigir partidas
corrigir jogadores
adicionar história
resolver conflitos
administrar fontes
```

sem acessar diretamente o banco.

---

# 54. Regras para o agente de implementação

O agente deve:

1. implementar por fases;
2. manter migrations reproduzíveis;
3. escrever testes para regras importantes;
4. evitar dependência direta de provider externo;
5. priorizar clareza sobre abstração excessiva;
6. manter tipagem estrita;
7. evitar `any` salvo justificativa concreta;
8. validar inputs externos;
9. registrar decisões arquiteturais relevantes;
10. documentar comandos e setup;
11. preservar compatibilidade mobile;
12. garantir que dados ausentes sejam tratados normalmente;
13. usar IDs internos independentes de providers;
14. manter imports idempotentes;
15. não adicionar funcionalidades fora do escopo sem necessidade.

---

# 55. O agente não deve

Não:

```text
criar microsserviços
adicionar Redis prematuramente
adicionar Elasticsearch
adicionar Kafka
criar sistema de usuários para torcedores
criar aplicativo mobile
adicionar IA
construir livescore complexo
criar financeiro
reimplementar todas as fases de uma vez
```

Também não deve redesenhar o modelo central apenas para encaixar mais facilmente o payload da API-Football.

O domínio interno tem precedência.

---

# 56. Princípio de simplicidade

Sempre preferir:

```text
solução simples
+
testável
+
evolutiva
```

a:

```text
arquitetura sofisticada
+
difícil de manter
+
não necessária no estágio atual
```

---

# 57. Decisões já fechadas

```text
DEC-001
Projeto pessoal e gratuito.

DEC-002
História é parte central do produto.

DEC-003
Produto será uma base interligada de conhecimento.

DEC-004
Notícias são conteúdo secundário.

DEC-005
Conteúdo autoral poderá ser integrado futuramente.

DEC-006
Web-first.

DEC-007
Masculino, feminino e base suportados pelo modelo.

DEC-008
Dados históricos devem suportar fontes.

DEC-009
Recordes e tabus preferencialmente derivados.

DEC-010
APIs externas são fontes, não banco principal.

DEC-011
Múltiplos providers devem ser suportáveis.

DEC-012
API-Football é provider inicial.

DEC-013
Sportmonks pode ser provider futuro.

DEC-014
Club e Team são entidades diferentes.

DEC-015
Categorias são representadas via Team.

DEC-016
Player e Coach derivam de Person.

DEC-017
Passagens são temporais.

DEC-018
Match é unidade factual central.

DEC-019
Eventos e estatísticas são armazenados granularmente.

DEC-020
Agregações são derivadas.

DEC-021
IDs externos são mapeados genericamente.

DEC-022
Navegação é centrada em entidades.

DEC-023
Home representa o presente.

DEC-024
Masculino, feminino e base reutilizam arquitetura.

DEC-025
Acervo será preenchido progressivamente.

DEC-026
Match e Season são hubs principais.

DEC-027
Notícias não são núcleo.

DEC-028
Arquitetura é monólito modular.

DEC-029
Next.js + TypeScript.

DEC-030
PostgreSQL é fonte de verdade.

DEC-031
Supabase como infraestrutura inicial.

DEC-032
API-Football nunca é chamada pelo frontend.

DEC-033
Toda integração passa por normalização.

DEC-034
Busca começa no PostgreSQL.

DEC-035
Sem Redis, microsserviços ou search engine no MVP.

DEC-036
Fatos e agregações ficam separados.
```

---

# 58. Pontos que continuam abertos

Não tomar essas decisões silenciosamente durante a implementação quando alterarem materialmente o produto:

```text
nome oficial do projeto
identidade visual
domínio
logo
paleta
tipografia
cobertura exata das categorias de base
fontes históricas prioritárias
política editorial das notícias
fontes permitidas para imagens
estratégia de backup de longo prazo
eventual aplicativo mobile
eventual monetização
eventual integração com Instagram/YouTube
módulo financeiro
```

Quando alguma dessas decisões bloquear desenvolvimento, escolher a alternativa mais reversível e documentar a hipótese.

---

# 59. Prioridade de qualidade

A ordem de prioridade é:

```text
1. integridade dos dados
2. clareza do domínio
3. confiabilidade
4. experiência mobile
5. navegabilidade
6. performance
7. estética
8. funcionalidades avançadas
```

Não sacrificar integridade histórica para acelerar uma tela.

---

# 60. Resultado esperado

Ao final do MVP, a plataforma deve parecer a fundação de um grande acervo digital do Corinthians, e não apenas um dashboard esportivo.

A arquitetura deve permitir que o produto cresça gradualmente para:

```text
100+ anos de jogos
milhares de jogadores
centenas de temporadas e competições
estatísticas históricas
recordes calculados
tabus
conteúdo autoral
feminino
base
financeiro
história institucional
```

sem necessidade de reconstrução estrutural do sistema.

Este documento deve ser tratado como fonte inicial de verdade para a implementação.

Mudanças estruturais relevantes devem ser registradas como novas decisões arquiteturais antes de serem incorporadas silenciosamente ao código.
