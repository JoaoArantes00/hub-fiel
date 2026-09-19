# CLAUDE.md

Instruções persistentes para o Claude Code neste repositório (Plataforma Corinthiana).

## Fontes de verdade

Leia antes de qualquer trabalho de implementação:

1. [docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md): produto, arquitetura, domínio, schema, regras e decisões fechadas.
2. [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md): ordem das fases, limites, critérios de aceite e formato de relatório.

Se qualquer instrução deste arquivo (ou do `AGENTS.md`) conflitar com esses dois documentos, os documentos vencem. Não os edite nem reformate sem pedido explícito.

## Como trabalhar

- Implemente **somente a fase pedida** e pare ao cumprir os critérios de aceite. Nunca antecipe fases futuras (plano §2).
- Antes de alterar código, inspecione o estado atual do repositório.
- Ao fim de uma fase, rode `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`, e entregue o relatório no formato do plano §24.
- Decisão pequena e reversível: registre em [docs/DECISIONS.md](docs/DECISIONS.md).
- Decisão estrutural (ORM, banco, modelo de `Match`, estratégia de IDs, autenticação, serviço externo): **pare e proponha** antes de implementar, com Problema, Opções, Trade-offs, Recomendação e Impacto (plano §23).
- Regras de engenharia: plano §4 e spec §54–55.

## Particularidades deste repositório

- Variáveis de ambiente passam por `getEnv()` em `src/config/env.ts` (validação lazy com Zod). Não leia `process.env` direto no código da aplicação. Variável nova entra no schema e no `.env.example`.
- Nunca versione `.env*`, exceto `.env.example`.
- TypeScript (~6.0) e ESLint (9) estão fixados por incompatibilidade de ferramentas. Antes de atualizar, leia F0-01 e F0-02 em `docs/DECISIONS.md`.
- Testes de integração com banco só rodam com `DATABASE_URL` definida no ambiente do shell (o Vitest não lê `.env.local`).
- Windows: no PowerShell 5.1, `Set-Content -Encoding utf8` grava BOM e quebra JSON (já aconteceu com o `package.json`). Prefira as ferramentas de edição de arquivos.

## Next.js

@AGENTS.md
