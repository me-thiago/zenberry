# PLANO DE AUDITORIA - Zenberry Platform

> Plataforma e-commerce de CBD/THC com chatbot AI (Gemini + LangChain RAG), Shopify OAuth, knowledge base
> Repositorios: `zenberry-api/` (NestJS 10.4) e `zenberry-front/` (Next.js 16 + React 19)
> Dominio: E-commerce wellness/cannabis -- compliance-first AI chatbot
> **Projeto menor:** ~16.7K LOC total (52 BE + 155 FE files) vs 60K+ dos outros projetos Dooor

---

## PRE-AUDIT CONTEXT

### O que e o Zenberry
Plataforma e-commerce focada em produtos CBD/THC para wellness:
- **E-commerce**: Catalogo de produtos com categorias, efeitos, beneficios, ingredientes, dosagem
- **Shopify Integration**: OAuth para auth, product sync, customer management via GraphQL API
- **AI Chatbot**: LangChain + Google Gemini com RAG (6 markdown files de knowledge base)
- **Compliance**: Regras rigorosas -- sem claims medicas, sempre recomendar profissional de saude
- **Port & Adapter**: CachePort, EmailPort, AI providers (Gemini, Anthropic, OpenAI, etc.)
- **Single-tenant**: Sem multi-tenancy, sem RBAC (diferente do resto do ecossistema)

### Comparacao com Ecossistema Dooor

| Aspecto | Zenberry | Scafold | Vaultly | Veris | Chats | Chorus |
|---|---|---|---|---|---|---|
| Backend LOC | **~4.343** | 17.052 | ~67K | ~60K | ~80K | 62.538 |
| Frontend LOC | **~12.337** | 21.017 | ~61K | ~50K | ~55K | 50.651 |
| Backend TS files | **52** | 168 | ~493 | ~613 | ~507 | 301 |
| Frontend TS/TSX | **155** | 230 | ~402 | ~392 | ~542 | 282 |
| Prisma models | **3** | ~15 | ~30 | ~40 | ~45 | 40 |
| Test files | **0** | 0 | 62 | 6 | 2 | 2 |
| Multi-tenancy | **Nao** | Sim | Sim | Sim | Sim | Sim |
| RBAC | **Nao** | Sim (34 perms) | Sim | Sim | Sim | Sim (23 perms) |
| Auth method | **Shopify OAuth** | OAuth + Magic Links | JWT + 2FA | JWT | JWT | JWT + Magic Links |
| AI integration | **Gemini + RAG** | LangChain | Multi-model RAG | LangChain | LangGraph | LangGraph |
| TypeScript strict BE | **?** | Desabilitado | Habilitado | Desabilitado | Desabilitado | Desabilitado |
| TypeScript strict FE | **Habilitado** | Habilitado | Habilitado | Desabilitado | Desabilitado | Desabilitado |
| Next.js version | **16** | 14/15 | 14/15 | 14/15 | 14/15 | 15.3 |
| Docker | **Dockerfile (BE)** | Dev + Compose | Multi-stage | Multi-stage | 6 Dockerfiles | Non-root ambos |
| CI/CD | **Zero** | Zero | Parcial | Fachada | Quebrado | Presente |
| Husky/hooks | **git-commit-msg-linter** | Quebrado | Zero | Zero | Zero | commitlint |
| CLAUDE.md | **274 linhas** | 653+844 | 219+193 | Presente | 889 | 1020+207 |
| Domain | **E-commerce CBD** | Template | Docs/Secrets | Risk/Process | WhatsApp | AI Agents |

### Sinais Pre-Audit (Positivos e Negativos)

**Positivos:**
- TypeScript strict mode habilitado no frontend
- Port & Adapter pattern implementado (CachePort, EmailPort, AI ports)
- CLAUDE.md com 274 linhas de regras claras
- Zod env validation
- Global ValidationPipe com whitelist/forbidNonWhitelisted
- ThrottlerGuard global (30/30s)
- Frontend rate limiting (10 msgs/min + 2s cooldown)
- Shopify token encryption com bcrypt
- Input sanitization no chat (HTML tag removal, length limits)
- Prisma schema simples e limpo (3 models)
- Next.js 16 + React 19 (mais recente do ecossistema)
- git-commit-msg-linter configurado

**Negativos:**
- Zero testes (configs existem mas nada escrito)
- Zero CI/CD
- Zero Docker no frontend
- Apenas 3 Prisma models -- muito simples? falta modelagem?
- Sem RBAC -- e-commerce precisa de admin vs customer?
- Sem Helmet/security headers
- Token em localStorage (padrao herdado do ecossistema)
- Knowledge base em memoria (nao persistido/indexado)
- Sem docker-compose
- Backend LOC muito baixo (~4.3K) -- pode indicar codigo incompleto

### Hipoteses a Validar

1. O token Shopify esta sendo armazenado de forma segura? (bcrypt ok, mas o fluxo completo?)
2. O chatbot AI respeita compliance CBD/THC? (sem claims medicas, etc.)
3. O RAG com 6 markdown files em memoria escala? (vs pgvector do Chorus/Vaultly)
4. A integracao Shopify GraphQL e segura? (token handling, error handling)
5. O frontend Next.js 16 esta usando features de SSR/Server Components?
6. A criptografia (encrypt.util.ts) usa algoritmos seguros?
7. O projeto esta "production-ready" ou e um MVP early-stage?
8. Existem admin endpoints? Como sao protegidos sem RBAC?
9. O CORS esta configurado corretamente?
10. O projeto herdou anti-patterns do ecossistema (JWT localStorage, no Helmet, etc.)?

---

## DIMENSOES DE AUDITORIA

| # | Dimensao | Peso | Descricao |
|---|----------|------|-----------|
| 1 | Seguranca | 20% | Auth Shopify, token handling, encryption, input validation, CORS, headers |
| 2 | Qualidade de Codigo | 20% | Patterns, type safety, SOLID, code smells, DRY, CLAUDE.md compliance |
| 3 | Testes & Cobertura | 15% | Test files, quality, CI enforcement, coverage |
| 4 | Escalabilidade & Performance | 15% | DB, caching, RAG performance, bundle, SSR |
| 5 | Manutenibilidade & DevOps | 15% | Code org, CI/CD, Docker, deps, git hygiene |
| 6 | Arquitetura Cross-Cutting | 10% | Port/Adapter, Shopify integration, AI architecture, frontend-backend consistency |
| 7 | Documentacao | 5% | CLAUDE.md, README, Swagger, knowledge base docs |

---

## AGENTES (10 em paralelo)

### Agent 1: Seguranca - Backend
**Scope:** `zenberry-api/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-1-security-backend.md`

**Checklist:**
- [ ] Analisar Shopify OAuth flow completo (register, login, token refresh, logout)
- [ ] Verificar como Shopify access token e armazenado (bcrypt hash antes de salvar?)
- [ ] Verificar se access token e descriptografado corretamente para API calls
- [ ] Analisar `encrypt.util.ts` e `decrypt.util.ts` -- algoritmo, IV, key derivation
- [ ] Verificar GENERAL_ENCRYPTION_SECRET -- como e gerado? tamanho adequado?
- [ ] Procurar hardcoded API keys/secrets em source files
- [ ] Verificar .env.example -- credenciais reais? tokens Shopify?
- [ ] Analisar JWT implementation -- secret, TTL, refresh flow
- [ ] Verificar UserSession model -- invalidacao, expiracao
- [ ] Analisar rate limiting (ThrottlerGuard 30/30s) -- adequado para e-commerce?
- [ ] Verificar input validation -- class-validator em todos DTOs?
- [ ] Analisar chat input sanitization -- HTML removal, length limits, spam detection
- [ ] Verificar CORS config -- origins permitidas
- [ ] Verificar Helmet/security headers -- existe?
- [ ] Analisar Shopify GraphQL API calls -- error handling, token validation
- [ ] Verificar se knowledge base markdown files podem ser injetados (prompt injection)
- [ ] Analisar soft delete implementation -- dados realmente inacessiveis?
- [ ] Verificar admin endpoints (Products CRUD) -- protecao adequada sem RBAC?
- [ ] Procurar admin bypass token `001239421348580124802138023832102310` (padrao ecossistema)
- [ ] Procurar ApiKeyGuard desabilitado (`return true`) -- padrao ecossistema
- [ ] Score 1-10 com sub-dimensoes

### Agent 2: Seguranca - Frontend
**Scope:** `zenberry-front/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-2-security-frontend.md`

**Checklist:**
- [ ] Analisar token storage -- localStorage? cookies? context?
- [ ] Verificar auth context -- como session token e gerenciado
- [ ] Procurar API keys/secrets hardcoded no source (NEXT_PUBLIC_*)
- [ ] Analisar `chat-api.ts` -- input sanitization, auth handling
- [ ] Verificar rate limiting frontend (10 msgs/min, 2s cooldown) -- bypassavel?
- [ ] Procurar `dangerouslySetInnerHTML` -- quantos? sanitizados?
- [ ] Verificar react-markdown -- plugins? rehype-raw? sanitizacao?
- [ ] Verificar CSP headers em next.config
- [ ] Analisar SSE (Server-Sent Events) -- auth no streaming?
- [ ] Verificar Shopify OAuth redirect -- open redirect possible?
- [ ] Analisar cart context -- dados sensiveis armazenados?
- [ ] Verificar publicRoutes -- rotas publicas vs protegidas
- [ ] Procurar console.log com dados sensiveis
- [ ] Verificar Axios interceptors -- token handling, error handling
- [ ] Analisar Next.js middleware -- existe? protecao de rotas?
- [ ] Score 1-10 com sub-dimensoes

### Agent 3: Qualidade de Codigo - Backend
**Scope:** `zenberry-api/src/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-3-quality-backend.md`

**Checklist:**
- [ ] Contar `any` e `as any` -- distribuicao por modulo
- [ ] Verificar tsconfig -- strict mode? flags habilitadas?
- [ ] Verificar aderencia ao CLAUDE.md (274 linhas) e CLAUDE-v2.md
- [ ] Listar arquivos >300 linhas (codebase pequeno, threshold menor)
- [ ] Analisar ChatService -- complexidade, responsabilidades
- [ ] Analisar ChatAgent -- LangChain patterns, error handling
- [ ] Analisar ContextService -- knowledge base loading, memory management
- [ ] Analisar ChatProductsService -- Shopify GraphQL integration
- [ ] Verificar separacao controller/service -- Prisma calls em controllers?
- [ ] Verificar Port & Adapter pattern -- CachePort, EmailPort, AI ports
- [ ] Analisar DTOs -- class-validator decorators completos?
- [ ] Analisar error handling patterns -- exception filters? try/catch?
- [ ] Verificar modulo Auth -- Shopify service, guards, strategies
- [ ] Verificar naming conventions -- kebab-case, PascalCase, camelCase
- [ ] Analisar duplicacao de codigo -- DRY violations?
- [ ] Verificar imports -- circular dependencies? forwardRef?
- [ ] Score 1-10 com sub-dimensoes

### Agent 4: Qualidade de Codigo - Frontend
**Scope:** `zenberry-front/src/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-4-quality-frontend.md`

**Checklist:**
- [ ] Contar `any` -- distribuicao por area
- [ ] Verificar tsconfig -- strict mode habilitado? flags?
- [ ] Listar arquivos >300 linhas
- [ ] Analisar 21 component directories -- organizacao, reutilizacao
- [ ] Analisar 6 custom hooks -- qualidade, responsabilidades
- [ ] Analisar 3 contexts (Auth, Cart, Chatbot) -- separacao de concerns
- [ ] Verificar React Query patterns (TanStack Query 5) -- staleTime, invalidation, error handling
- [ ] Verificar "use client" vs Server Components -- Next.js 16 bem utilizado?
- [ ] Analisar React Hook Form + Zod validation -- cobertura
- [ ] Verificar shadcn/ui usage -- modificados ou puros?
- [ ] Verificar Tailwind CSS 4 -- classes consistentes? design tokens?
- [ ] Analisar embla-carousel -- performance, accessibility
- [ ] Verificar i18n -- existe? necessario para CBD compliance?
- [ ] Analisar accessibility -- aria-labels, focus, keyboard nav, screen readers
- [ ] Verificar responsive design -- mobile-first para e-commerce?
- [ ] Analisar SEO -- meta tags, structured data (importante para e-commerce!)
- [ ] Score 1-10 com sub-dimensoes

### Agent 5: Testes & Cobertura - Backend
**Scope:** `zenberry-api/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-5-tests-backend.md`

**Checklist:**
- [ ] Confirmar zero test files
- [ ] Verificar jest configs (jest-unit.json, jest-integration.json, jest-e2e.json)
- [ ] Analisar package.json scripts -- `test` scripts existem?
- [ ] Verificar coverage exclusions -- adequadas?
- [ ] Analisar testabilidade -- DI correto? services mockables?
- [ ] Identificar modulos criticos sem testes (Auth/Shopify, Chat/AI, Products, Encryption)
- [ ] Verificar se existem mocks, fixtures, seed data
- [ ] Analisar complexidade dos services -- quais precisam de testes urgentes?
- [ ] Comparar com ecossistema (Scafold 0, Vaultly 62, Veris 6, Chats 2, Chorus 2)
- [ ] Propor estrategia de testes prioritizada para e-commerce + chatbot
- [ ] Foco especial: testes para Shopify OAuth flow (critico para auth!)
- [ ] Foco especial: testes para chat sanitization e compliance
- [ ] Score 1-10

### Agent 6: Testes & Cobertura - Frontend
**Scope:** `zenberry-front/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-6-tests-frontend.md`

**Checklist:**
- [ ] Confirmar zero test files
- [ ] Verificar package.json -- test dependencies? (vitest, jest, testing-library?)
- [ ] Verificar scripts -- `test` script existe?
- [ ] Analisar testabilidade -- hooks desacoplados? contexts testable?
- [ ] Identificar componentes criticos sem testes (Auth flow, Cart, Chat, Product catalog)
- [ ] Verificar Storybook ou similar
- [ ] Analisar chat-examples.tsx -- pode servir como base para testes?
- [ ] Propor estrategia de testes com foco em e-commerce UX
- [ ] Foco especial: cart flow (add, remove, checkout)
- [ ] Foco especial: chat rate limiting (bypassavel sem testes!)
- [ ] Foco especial: Shopify auth flow (login, register, session)
- [ ] Score 1-10

### Agent 7: Escalabilidade & Performance - Backend
**Scope:** `zenberry-api/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-7-scalability-backend.md`

**Checklist:**
- [ ] Analisar Prisma schema (3 models) -- indexes? @@index, @@unique?
- [ ] Verificar N+1 patterns -- poucos models mas queries complexas?
- [ ] Analisar Redis caching -- CachePort implementation, TTLs, strategy
- [ ] Verificar knowledge base em memoria -- tamanho, startup time, memory footprint
- [ ] Analisar RAG approach -- 6 markdown files em memoria vs pgvector
- [ ] Verificar circuit breakers para Gemini API
- [ ] Analisar timeouts em chamadas Gemini/Shopify
- [ ] Verificar connection pooling -- Prisma, Redis
- [ ] Analisar rate limiting (30/30s) -- adequado? Redis-backed ou in-memory?
- [ ] Verificar SSE streaming -- backpressure? connection limits?
- [ ] Verificar Shopify API rate limits -- handling, retry logic
- [ ] Analisar cron jobs (@nestjs/schedule) -- o que roda? distributed locking?
- [ ] Verificar WebSocket -- existe? implementado? scaling?
- [ ] Analisar healthcheck -- existe?
- [ ] Score 1-10 com sub-dimensoes

### Agent 8: Escalabilidade & Performance - Frontend
**Scope:** `zenberry-front/`
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-8-scalability-frontend.md`

**Checklist:**
- [ ] Analisar bundle -- deps pesadas? (embla-carousel, react-markdown, graphql)
- [ ] Verificar dynamic imports -- `next/dynamic` usage
- [ ] Verificar loading.tsx e error.tsx -- por rota
- [ ] Contar Suspense boundaries
- [ ] Analisar SSR vs Client Components -- Next.js 16 bem utilizado?
- [ ] Verificar next/image usage -- otimizacao de imagens (CRITICO para e-commerce!)
- [ ] Verificar next/font usage
- [ ] Analisar React Query config -- staleTime, cacheTime, prefetching
- [ ] Verificar chat localStorage persistence -- tamanho, cleanup
- [ ] Analisar product catalog -- paginacao, filtragem, busca eficiente?
- [ ] Verificar SEO performance -- SSG/ISR para paginas de produto?
- [ ] Analisar Shopify product sync -- caching, stale data handling
- [ ] Verificar optimizePackageImports em next.config
- [ ] Analisar Core Web Vitals concerns -- LCP, FID, CLS
- [ ] Score 1-10 com sub-dimensoes

### Agent 9: Manutenibilidade & DevOps
**Scope:** Ambos repos
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-9-maintainability-devops.md`

**Checklist:**
- [ ] Analisar CLAUDE.md (274 linhas) vs realidade do codigo
- [ ] Analisar CLAUDE-v2.md -- mudancas, conflitos com v1
- [ ] Verificar README backend + frontend -- completude
- [ ] Verificar Swagger/OpenAPI setup
- [ ] Analisar Docker setup backend -- Dockerfile quality, image size
- [ ] Verificar por que NAO existe Dockerfile no frontend
- [ ] Verificar docker-compose -- existe? necessario?
- [ ] Verificar .dockerignore
- [ ] Verificar package-lock.json -- commitado ou .gitignore?
- [ ] Analisar dependencias -- mortas? duplicadas? (graphql instalado mas usado?)
- [ ] Verificar ESLint config -- no-explicit-any?
- [ ] Verificar Husky hooks -- git-commit-msg-linter funcional?
- [ ] Analisar .gitignore -- completo? secrets protegidos?
- [ ] Verificar Prisma migrations -- organizacao, naming, documentation
- [ ] Verificar Prettier config -- formatacao consistente?
- [ ] Analisar build scripts -- SWC config, copy:assets
- [ ] Verificar env management -- .env.example completo?
- [ ] Analisar docs/ folder -- ISSUE-INDEX.md, tasks, migrations, implementations
- [ ] Score backend e frontend separados

### Agent 10: Arquitetura Cross-Cutting & Domain
**Scope:** Ambos repos
**Output:** `/Users/thiagon/Documents/me-thiago/zenberry/reports/agent-10-architecture-domain.md`

**Checklist:**
- [ ] Frontend-Backend consistency -- types, endpoints, DTOs
- [ ] Port & Adapter implementation -- CachePort, EmailPort, AI ports reais ou skeleton?
- [ ] Shopify integration architecture -- auth flow, product sync, GraphQL patterns
- [ ] AI/LLM architecture -- LangChain agent, tool system, context injection
- [ ] RAG pipeline -- knowledge base loading, section extraction, search
- [ ] Chat architecture -- request flow, streaming, state management
- [ ] Product catalog architecture -- Prisma vs Shopify source of truth? sync strategy?
- [ ] Auth architecture -- Shopify OAuth vs JWT dual system
- [ ] Cart architecture -- frontend-only? persisted? Shopify cart integration?
- [ ] CBD/THC compliance enforcement -- system prompt, guardrails, validation
- [ ] TOKENS injection system -- completude, usage patterns
- [ ] Comparar com Scafold (5.1/10) -- quanto do template foi mantido/modificado?
- [ ] Comparar com ecossistema geral -- Zenberry e um "filho mais novo" do Scafold?
- [ ] Avaliar production-readiness -- MVP ou ready?
- [ ] Analisar gap de RBAC -- e-commerce precisa de admin/customer roles?
- [ ] Score 1-10 com sub-dimensoes

---

## TEMPLATE DO REPORT

Cada agente deve produzir um report com:

```markdown
# Agent N - [Titulo]

**Date:** 2026-02-04
**Scope:** [path]
**Score: X.X/10**

## Executive Summary
[2-3 paragrafos]

## Scores Summary
| Sub-dimensao | Score (1-10) | Justificativa |

## [Secoes detalhadas por sub-dimensao]

### Finding: [titulo]
- **Severidade:** CRITICAL | HIGH | MEDIUM | LOW
- **Arquivo:** [path completo]
- **Evidencia:** [code snippet ou descricao]
- **Impacto:** [descricao]

## Comparacao com Ecossistema (Scafold/Vaultly/Veris/Chats/Chorus)
[tabela comparativa relevante]

## Nota sobre Tamanho do Projeto
[Contexto: Zenberry tem ~16.7K LOC vs 60-113K dos outros projetos. Scores devem refletir
qualidade relativa ao tamanho, nao penalizar por ser menor. Um projeto pequeno bem-feito
pode ter score alto.]

## Critical Findings (priorizados)

## Positive Highlights

## Prioritized Recommendations
```

---

## SCORING

| Score | Significado |
|-------|-------------|
| 9-10 | Exemplar, referencia |
| 7-8 | Bom, poucos problemas |
| 5-6 | Adequado, melhorias necessarias |
| 3-4 | Abaixo do esperado, riscos significativos |
| 1-2 | Critico, requer atencao imediata |

**NOTA IMPORTANTE sobre scoring:**
Zenberry e ~4-7x menor que os outros projetos. Isso significa:
- Menos superficie de ataque -> scores de seguranca podem ser maiores
- Menos codigo -> menos oportunidades para code smells
- Menos features -> arquitetura mais simples (nao penalizar)
- Menos testes -> MESMO problema sistemico (penalizar igualmente)
- O score deve refletir QUALIDADE do que existe, nao QUANTIDADE

---

## META

O Zenberry e especialmente interessante porque:
1. **Dominio totalmente diferente** -- e-commerce vs infra/SaaS dos outros projetos
2. **Projeto mais novo/menor** -- pode ser mais limpo ou mais incompleto
3. **Next.js 16 + React 19** -- versoes mais recentes do ecossistema
4. **Shopify integration** -- dependencia externa critica (auth, products, checkout)
5. **CBD/THC compliance** -- dominio regulado, AI precisa ser cautelosa
6. **Sem multi-tenancy/RBAC** -- design simplificado vs ecossistema
7. **RAG em memoria** (vs pgvector) -- abordagem diferente de knowledge base
8. **3 Prisma models** -- schema extremamente simples (User, UserSession, Product)
9. **GraphQL dependency** -- instalado mas uso limitado (Shopify only?)
10. **SWC build** -- build tool diferente dos outros projetos (tsc)
