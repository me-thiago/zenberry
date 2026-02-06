# ZENBERRY PLATFORM - CONSOLIDATED AUDIT SCORECARD

> Auditoria realizada por 10 agentes em paralelo analisando `zenberry-api` (NestJS 10.4) e `zenberry-front` (Next.js 16 + React 19)
> Zenberry e uma plataforma e-commerce de CBD/THC com chatbot AI (Gemini + LangChain RAG), Shopify OAuth, knowledge base.
> Derivado do Scafold (5.1/10) -- projeto menor (~16.7K LOC) com dominio regulado (cannabis/wellness).
> **Menor projeto do ecossistema** mas com diferenciais unicos: httpOnly cookies, zero dangerouslySetInnerHTML, apenas 3 `any` no frontend.

---

## SCORECARD GERAL

```
                              Backend    Frontend    Ponderado
                              -------    --------    ---------
Seguranca            (20%)     5.2        6.8         6.0
Qualidade de Codigo  (20%)     7.4        7.0         7.2
Testes & Cobertura   (15%)     1.5        0.5         1.0
Escalabilidade       (15%)     4.5        5.5         5.0
Manutenibilidade     (15%)     5.5        4.5         5.0
Arquitetura (cross)  (10%)          5.8              5.8
Documentacao          (5%)     5.5        3.0         4.3
                              -------    --------    ---------
SCORE GERAL                    5.1        5.1         5.1/10
```

**Veredicto: O Zenberry e o projeto com MELHOR seguranca frontend do ecossistema (6.8/10) -- UNICO com httpOnly cookies e ZERO dangerouslySetInnerHTML. Tem a melhor qualidade de codigo combinada (7.2/10) com apenas 3 `any` no frontend e 34 no backend. Porem, o backend tem endpoints de produtos completamente desprotegidos, autenticacao O(N) via bcrypt scan, e ~60% de dead code herdado do Scafold. A documentacao e a PIOR do ecossistema (4.3) devido a uma crise de identidade tripla (Scaffold/Dooor/Fonte Imagem -- nenhum diz "Zenberry"). Testes sao virtualmente inexistentes (1.0/10).**

---

## COMPARACAO COM ECOSSISTEMA

```
                          Scafold    Vaultly    Veris    Chats    Chorus    Zenberry
                          -------    -------    -----    -----    ------    --------
Seguranca         (20%)    5.0       5.7       4.1      4.1      4.0       6.0
Qualidade         (20%)    7.0       6.8       4.9      5.5      6.5       7.2
Testes            (15%)    0.8       4.0       2.1      1.3      0.9       1.0
Escalabilidade    (15%)    5.5       5.8       5.1      4.8      4.2       5.0
Manutenibilidade  (15%)    4.7       7.3       4.7      3.6      7.6       5.0
Arquitetura       (10%)    6.8       7.3       6.7      6.3      6.5       5.8
Documentacao       (5%)    8.3       8.3       4.5      3.0      7.8       4.3
                          -------    -------    -----    -----    ------    --------
SCORE GERAL                5.1       6.2       4.3      3.9      5.0       5.1
```

```
RANKING
=======
1. Vaultly    6.2/10   ████████████░░░░░░░░  (Adequado-Bom)
2. Scafold    5.1/10   ██████████░░░░░░░░░░  (Adequado)
3. Zenberry   5.1/10   ██████████░░░░░░░░░░  (Adequado)
4. Chorus     5.0/10   ██████████░░░░░░░░░░  (Adequado)
5. Veris      4.3/10   ████████░░░░░░░░░░░░  (Abaixo do Esperado)
6. Chats      3.9/10   ███████░░░░░░░░░░░░░  (Abaixo do Esperado)
```

**Insight principal:** Zenberry empata com Scafold (5.1) mas com perfil completamente diferente: **melhor seguranca** (6.0 vs 5.0) e **melhor qualidade** (7.2 vs 7.0), mas **pior documentacao** (4.3 vs 8.3) e **pior arquitetura** (5.8 vs 6.8). E o UNICO projeto do ecossistema que quebrou o padrao de JWT em localStorage (usa httpOnly cookies) e o UNICO com zero dangerouslySetInnerHTML.

---

## RELACAO ZENBERRY <-> SCAFOLD

```
                    SCAFOLD (Template 5.1)
                    /      |       \        \
                   /       |        \        \
            VAULTLY (6.2) VERIS (4.3) CHATS (3.9) ZENBERRY (5.1)
            [+1.1]        [-0.8]     [-1.2]      [±0.0]
            Melhorou       Degradou   Degradou    Manteve
                                        |
                                        v
                                 CHORUS (5.0)
                                 [+1.1 vs Chats]
```

### O que Zenberry mudou vs Scafold:

| Aspecto | Scafold (5.1) | Zenberry (5.1) | Delta |
|---|---|---|---|
| Seguranca | 5.0 | **6.0** | **+1.0** (melhorou!) |
| Qualidade | 7.0 | **7.2** | **+0.2** |
| Testes | 0.8 | **1.0** | +0.2 |
| Manutenibilidade | 4.7 | **5.0** | +0.3 |
| Escalabilidade | 5.5 | **5.0** | **-0.5** |
| Arquitetura | 6.8 | **5.8** | **-1.0** (pior!) |
| Documentacao | 8.3 | **4.3** | **-4.0** (muito pior!) |

**Padrao claro:** Zenberry melhorou onde Scafold era fraco (seguranca via httpOnly cookies, manutenibilidade com mais infra), mas DEGRADOU onde Scafold era forte (documentacao destruida por crise de identidade tripla, arquitetura degradada por dual product system e dead code). O resultado liquido e zero -- mesmo score geral que o template.

---

## TOP 15 FINDINGS CRITICOS

### Severidade CRITICA

| # | Finding | Repo | Impacto |
|---|---------|------|---------|
| 1 | **O(N) bcrypt full-table scan** em cada request autenticado -- carrega TODOS os users e itera com bcrypt.compare (~100ms cada). 1000 users = ~100s por auth check | Backend | DoS vector + inviabiliza crescimento |
| 2 | **Products CRUD completamente desprotegido** -- POST, PATCH, DELETE sem `@UseGuards(ShopifyJwtGuard)`. Qualquer anonimo pode criar/modificar/deletar produtos | Backend | Data tampering em producao |
| 3 | **Zero RBAC** -- sem sistema de roles. Unico "role": customer autenticado. Sem admin panel | Backend | Sem gestao de acesso |
| 4 | **ZERO test files em ambos repos** -- 0 testes, 0 mocks, 0 fixtures, 0 scripts. `npm test` falha com "missing script" | Ambos | Zero rede de seguranca para 16.7K LOC |
| 5 | **Zero circuit breakers para Gemini AI** -- se Gemini cai, todo chat falha sem fallback, retry ou cached response | Backend | Falha em cascata, sem resiliencia |
| 6 | **Dual product system sem sync** -- Frontend usa produtos do Shopify GraphQL. Backend tem tabela Product no Prisma. Zero fluxo entre eles. Tabela Prisma provavelmente vazia | Ambos | Arquitetura incoerente |

### Severidade ALTA

| # | Finding | Repo |
|---|---------|------|
| 7 | **CryptoJS AES modo passphrase fraco** -- MD5-based KDF, sem HMAC, sem IV explicito | Backend |
| 8 | **Zero security headers** -- sem Helmet, sem X-Content-Type-Options, X-Frame-Options, HSTS, CSP | Ambos |
| 9 | **Chat endpoints completamente publicos** (`POST /chat/ask`, `/chat/stream`) -- risco de abuso de custo na API Google AI | Backend |
| 10 | **ZERO dynamic imports** -- `next/dynamic` e `React.lazy` completamente ausentes. ChatbotModal (~150KB) bundled em TODA pagina | Frontend |
| 11 | **~20+ MB de background images nao otimizadas** via CSS `backgroundImage` (bypassa next/image). Hero: 3.9 MB. Carousel: 9 PNGs de 1.1-1.7 MB | Frontend |
| 12 | **Zero CI/CD** em ambos repos -- sem linting, type checking, testes ou build verification automatizados | Ambos |
| 13 | **Crise de identidade tripla** -- CLAUDE.md diz "Scaffold API", README diz "Dooor Backend Platform", Swagger diz "Fonte Imagem API". Nenhum diz "Zenberry" | Backend |
| 14 | **tsconfig strict mode desabilitado** no backend -- `strictNullChecks: false`, `noImplicitAny: false`. Contradiz CLAUDE-v2.md | Backend |
| 15 | **SEO essencialmente ausente** (3.0/10) -- zero per-page metadata, zero `generateMetadata`, zero JSON-LD, zero Open Graph, zero sitemap.xml. Falha fundamental para e-commerce | Frontend |

---

## ANALISE POR DIMENSAO

### 1. SEGURANCA (Peso: 20%)

**Backend: 5.2/10 | Frontend: 6.8/10 | Ponderado: 6.0/10**

| Sub-dimensao | Backend | Frontend |
|---|---|---|
| Autenticacao | 4.5 (Shopify JWT ok, mas O(N) bcrypt scan) | 7.5 (**httpOnly cookies -- UNICO!**) |
| Autorizacao/RBAC | 4.0 (Products CRUD sem guard, zero RBAC) | 5.5 (route protection parcial) |
| Encryption | 4.0 (CryptoJS AES modo fraco) | - |
| Input Validation | 6.5 (ValidationPipe ok, falta whitelist) | 7.5 (Zod schemas) |
| API Security | 4.0 (zero Helmet, CORS dual-init, zero rate limit server) | 2.0 (zero CSP) |
| AI/LLM Security | 5.0 (compliance guardrails, mas sem input sanitization) | - |
| Data Protection | 5.5 (Prisma isolation ok) | - |
| XSS Protection | - | **7.0** (zero dangerouslySetInnerHTML -- MELHOR!) |
| Token Storage | - | **7.5** (httpOnly cookies -- MELHOR!) |
| SSE Security | - | 4.0 (wildcard CORS, sem auth, sem rate limit) |
| Rate Limiting | 4.0 (ThrottlerGuard existe mas client-side chat) | 6.0 (client-side, bypassavel) |

**MELHOR seguranca do ecossistema** (6.0 vs Vaultly 5.7). O frontend e genuinamente mais seguro que qualquer outro projeto: httpOnly cookies (unico!) e zero dangerouslySetInnerHTML (unico!). O backend e prejudicado pelo O(N) bcrypt scan (DoS vector), endpoints desprotegidos e zero Helmet.

---

### 2. QUALIDADE DE CODIGO (Peso: 20%)

**Backend: 7.4/10 | Frontend: 7.0/10 | Ponderado: 7.2/10**

| Sub-dimensao | Backend | Frontend |
|---|---|---|
| `any` Occurrences | **34** (7.9/KLOC -- melhor absoluto!) | **3** (melhor do ecossistema!) |
| Controller/Service Separation | **9** (zero Prisma em controllers) | - |
| Architecture & Separation | **9** (modulos bem isolados) | 8.5 |
| Swagger Coverage | **8** (100% @ApiProperty em DTOs) | - |
| DTO Validation | **7** (class-validator presente) | 7.5 (RHF + Zod) |
| TypeScript Strict | **4** (ALL flags desabilitadas no BE!) | **8.5** (strict: true no FE!) |
| DRY / Duplication | 6 (product formatting duplicada) | - |
| shadcn/ui Consistency | - | **9.0** |
| Server/Client Components | - | 8.5 (66% server, 34% client) |
| SEO | - | **3.0** (critico para e-commerce!) |
| Accessibility | - | 4.5 (sem focus trapping, sem ARIA) |
| Error Boundaries | - | **2.0** (zero error.tsx!) |

**MELHOR qualidade combinada do ecossistema** (7.2 vs Scafold 7.0). O backend tem a MELHOR contagem absoluta de `any` (34 vs Scafold 111, vs Veris 620). O frontend tem apenas 3 `any` -- melhor do ecossistema. Zero Prisma em controllers (empatado com Scafold). Porem, SEO e uma falha critica para e-commerce e error boundaries sao inexistentes.

**Comparacao `any` backend:**

| Projeto | `any` count | LOC | `any`/KLOC |
|---|---|---|---|
| **Zenberry** | **34** | 4.3K | 7.9 |
| Scafold | 111 | ~15K | ~7.4 |
| Chats | 392 | ~30K | ~13 |
| Vaultly | 421 | ~30K | ~14 |
| Chorus | 463 | ~62K | ~7.4 |
| Veris | 620 | ~30K | ~21 |

---

### 3. TESTES & COBERTURA (Peso: 15%)

**Backend: 1.5/10 | Frontend: 0.5/10 | Ponderado: 1.0/10**

| Metrica | Backend | Frontend |
|---|---|---|
| Arquivos de teste | **0** | **0** |
| Test ratio | **0%** | **0%** |
| Jest/Vitest instalado | Sim (@nestjs/testing, ts-jest) | **Nada** |
| jest.config existente | **Sim** (3 configs: unit, integration, e2e) | **Nao** |
| Script `test` | **Nao** (npm test falha!) | **Nao** |
| CI roda testes? | **Zero CI** | **Zero CI** |
| Testabilidade | **8/10** (DI limpo, separation of concerns) | **7/10** (pure functions extraidas) |

**Comparacao:**

| Projeto | Test Files BE | Test Files FE | Score |
|---|---|---|---|
| Vaultly | **62** | 0 | 4.0 |
| Veris | 6 | 0 | 2.1 |
| Chats | 2 | 0 | 1.3 |
| **Zenberry** | **0** | **0** | **1.0** |
| Chorus | 2 | 0 | 0.9 |
| Scafold | 0 | 0 | 0.8 |

**Zenberry tem score de testes marginalmente melhor que Chorus e Scafold** porque tem Jest instalado e 3 configs bem estruturadas (unit, integration, e2e), alem de alta testabilidade arquitetural. Porem a config de e2e esta quebrada (rootDir errado, moduleNameMapper ausente) e o npm test falha. Estimativa: ~140 testes BE + ~286 testes FE necessarios para cobertura minima.

---

### 4. ESCALABILIDADE & PERFORMANCE (Peso: 15%)

**Backend: 4.5/10 | Frontend: 5.5/10 | Ponderado: 5.0/10**

| Sub-dimensao | Backend | Frontend |
|---|---|---|
| Database Indexing | **6** (Prisma indexes ok) | - |
| Query Efficiency | 2 (O(N) bcrypt scan!) | - |
| Caching | 3 (CacheModule built mas NUNCA importado!) | - |
| AI Provider Resilience | **1** (zero circuit breakers, zero timeouts) | - |
| External API Resilience | 2 (zero timeouts em Shopify fetch) | - |
| Rate Limiting | 4 (in-memory, nao distribuido) | - |
| Streaming/SSE | 3 (sem backpressure, sem timeout) | - |
| Horizontal Scalability | 3 (rate limit in-memory) | - |
| Bundle / Dynamic Imports | - | **1** (ZERO dynamic imports!) |
| next/image Usage | - | **8** (bem usado com ISR) |
| next/font Usage | - | **9** (otimizado) |
| React Query Config | - | **9** (staleTime configurado) |
| ISR / SSG | - | **7** (revalidate: 60 em produtos) |
| Core Web Vitals | - | 4 (images via CSS, sem sizes) |
| Virtualization | - | **1** (zero, critico para chat) |

**Dead Code de Infraestrutura (construido mas nao utilizado):**
- Redis CacheModule + RedisCacheAdapter: implementado, **nunca importado**
- ChatTools (LangChain): instanciado, **nunca vinculado ao modelo**
- WebSocket (IoAdapter + socket.io): configurado, **zero gateway**
- MulterModule: registrado, **zero upload endpoints**
- ScheduleModule: importado, **zero cron jobs**

**Gaps sistemicos (herdados do Scafold):**

| Gap Sistemico | Scafold | Zenberry | Status |
|---|---|---|---|
| Zero circuit breakers | ORIGEM | **NAO RESOLVIDO** | 0% |
| Zero distributed locking | ORIGEM | **NAO RESOLVIDO** | 0% |
| Sem connection pooling Prisma | ORIGEM | **NAO RESOLVIDO** | 0% |
| Sem timeouts em AI providers | ORIGEM | **NAO RESOLVIDO** | 0% |

---

### 5. MANUTENIBILIDADE & DEVOPS (Peso: 15%)

**Backend: 5.5/10 | Frontend: 4.5/10 | Ponderado: 5.0/10**

| Sub-dimensao | Backend | Frontend |
|---|---|---|
| Documentacao (docs/) | 7.5 (estrutura boa) | - |
| Documentacao (acuracia) | **2.5** (crise de identidade!) | 5.0 (README ref files inexistentes) |
| Docker | 3.5 (root, devDeps em prod, sudo/git/jq) | **1.0** (sem Dockerfile!) |
| Git Hooks | 4.0 (pre-push quebrado, ref script inexistente) | - |
| CI/CD | **0.0** (zero pipelines) | **0.0** (zero pipelines) |
| Env Management | 6.5 (Zod parcial, falta GOOGLE_AI_API_KEY) | 2.0 (sem .env.example) |
| ESLint/TypeScript | 3.0 (no-explicit-any: off, strict: off) | **8.0** (strict: true) |
| Dependencies | 4.0 (Prisma v4.9 muito desatualizado) | 7.5 (limpas) |
| Swagger/API Docs | 7.0 | - |
| Build/Scripts | 5.5 (prisma migrate deploy no start!) | - |
| package-lock.json | **.gitignore** (anti-pattern) | - |

**Comparacao:**

| Aspecto | Scafold | Zenberry | Melhoria? |
|---|---|---|---|
| CI/CD | Zero | **Zero** | Nao |
| Docker | Dev + Compose | Root + devDeps | **Pior** |
| Git Hooks | Quebrado | **Quebrado** (pre-push ref inexistente) | Nao |
| ESLint backend | any: off | any: off | Nao |
| ESLint frontend | - | Funcional | Sim |
| package-lock | .gitignore | .gitignore | Nao |

---

### 6. ARQUITETURA CROSS-CUTTING (Peso: 10%)

**Score: 5.8/10**

| Sub-dimensao | Score | Notas |
|---|---|---|
| Frontend-Backend Consistency | 4.5 | `AskResponse` type tem campo `question` que backend nunca retorna |
| Port & Adapter Quality | 3.0 | 14 injection tokens, 0 injetados. 2 ports implementados, nunca importados |
| Shopify Integration | **7.0** | OAuth flow, product queries, checkout funcionais |
| AI/LLM Architecture | **6.5** | Gemini + LangChain RAG, system prompt com compliance guardrails |
| Chat Architecture | 6.0 | Streaming SSE, chat history, mas GET params para history |
| Product Catalog | 3.5 | Dual system (Shopify + Prisma) sem sync |
| Auth Architecture | 5.5 | httpOnly cookies (bom!), mas O(N) bcrypt scan |
| Cart Architecture | **6.5** | Client-side cart, Shopify checkout |
| Compliance Architecture | **7.0** | CBD/THC guardrails no system prompt, age verification |
| RBAC Gap | **2.0** | Zero RBAC, zero admin panel |
| Production Readiness | 4.5 | Mock orders, hardcoded reviews, no error monitoring |

**Classificacao: Late MVP / Early Alpha**

**PIOR arquitetura do ecossistema** (5.8 vs Chats 6.3). O dual product system e a falha arquitetural mais fundamental: frontend consome Shopify, backend tem tabela Product vazia, zero integracao. ~60% do backend e dead code do Scafold (WebSocket, Multer, Schedule, Cache -- tudo configurado, nada usado).

---

### 7. DOCUMENTACAO (Peso: 5%)

**Backend: 5.5/10 | Frontend: 3.0/10 | Ponderado: 4.3/10**

| Aspecto | Backend | Frontend |
|---|---|---|
| CLAUDE.md | Existe (herdado do Scafold, diz "Scaffold API") | Ausente |
| README | Presente (diz "Dooor Backend Platform") | Ref 6 files inexistentes |
| Swagger | **100% @ApiProperty** em DTOs, diz "Fonte Imagem API" | N/A |
| docs/ folder | Boa estrutura (ISSUE-INDEX, tasks, impl docs) | Ausente |
| Identidade do Projeto | **NENHUM arquivo diz "Zenberry"** | **NENHUM arquivo diz "Zenberry"** |

**PIOR documentacao do ecossistema** (4.3 vs Chats 3.0... na verdade Chats tem 3.0 mas nao tem crise de identidade tripla). A documentacao tecnica tem boa estrutura (docs/ folder, Swagger) mas o conteudo e herdado e nunca atualizado. O Swagger e util para desenvolvimento mas o nome "Fonte Imagem API" confunde. Frontend README promete 6 docs que nao existem.

---

## PONTOS FORTES UNICOS DO ZENBERRY

1. **UNICO projeto com httpOnly cookies** para auth tokens (todos os outros usam localStorage)
2. **UNICO projeto com ZERO dangerouslySetInnerHTML** (todos os outros derivados tem)
3. **Menor contagem de `any`** no frontend (3) E no backend (34) -- melhor type discipline
4. **Melhor qualidade de codigo combinada** (7.2 -- supera Scafold 7.0)
5. **Melhor seguranca do ecossistema** (6.0 -- supera Vaultly 5.7)
6. **Shopify integration** (unico e-commerce do ecossistema)
7. **AI chatbot com compliance CBD/THC** (guardrails regulatorios no system prompt)
8. **ISR (Incremental Static Regeneration)** em paginas de produto (revalidate: 60)
9. **React Compiler habilitado** (unico projeto)
10. **Next.js 16 + React 19** (versoes mais recentes do ecossistema)

---

## PONTOS FRACOS UNICOS DO ZENBERRY

1. **PIOR documentacao do ecossistema** (4.3) -- crise de identidade tripla, nenhum arquivo diz "Zenberry"
2. **PIOR arquitetura do ecossistema** (5.8) -- dual product system incoerente
3. **~60% do backend e dead code do Scafold** (WebSocket, Multer, Schedule, Cache, 14 tokens nao injetados)
4. **O(N) bcrypt auth** -- inviabiliza crescimento alem de ~100 usuarios
5. **Products CRUD publicamente acessivel** -- qualquer anonimo pode criar/deletar produtos
6. **Mock data em producao** -- orders e reviews hardcoded (MOCK_ORDERS, 4.5 stars, 10 reviews, preco original = preco + 10)
7. **Zero admin panel** -- sem gestao operacional do e-commerce

---

## PADROES SISTEMICOS QUEBRADOS PELO ZENBERRY

Zenberry e o UNICO projeto do ecossistema que quebrou 3 padroes negativos herdados do Scafold:

| Padrao Sistemico | Projetos Afetados | Zenberry |
|---|---|---|
| JWT em localStorage | Scafold, Vaultly, Veris, Chats, Chorus (5/5) | **QUEBROU** (httpOnly cookies) |
| dangerouslySetInnerHTML sem sanitizacao | Vaultly, Veris, Chats, Chorus (4/5) | **QUEBROU** (zero ocorrencias) |
| `any` excessivo 390+ no backend | Vaultly, Veris, Chats, Chorus (4/5) | **QUEBROU** (apenas 34) |

---

## ROADMAP DE MELHORIAS PRIORIZADO

### FASE 0: EMERGENCIA (Imediato)

> Foco: Proteger endpoints e corrigir autenticacao

- [ ] **Adicionar `@UseGuards(ShopifyJwtGuard)`** em ProductsController (POST, PATCH, DELETE)
- [ ] **Adicionar `@UseGuards`** em UsersController GET endpoint
- [ ] **Adicionar auth** em chat endpoints (`/chat/ask`, `/chat/stream`) ou rate limiting agressivo
- [ ] **Substituir O(N) bcrypt scan** por indexed token lookup (hashed token column + index)
- [ ] **Adicionar `GOOGLE_AI_API_KEY`** ao schema de validacao Zod

### FASE 1: SEGURANCA (Semana 1-2)

- [ ] **Instalar Helmet** com configuracao adequada
- [ ] **Adicionar CSP** no next.config.ts
- [ ] **Corrigir CORS** -- remover dual-initialization, usar whitelist explicita
- [ ] **Substituir CryptoJS** por crypto nativo do Node.js (scryptSync + randomBytes)
- [ ] **Adicionar `whitelist: true` e `forbidNonWhitelisted: true`** no ValidationPipe global
- [ ] **Adicionar server-side rate limiting** em chat endpoints

### FASE 2: IDENTIDADE & DOCUMENTACAO (Semana 3)

- [ ] **Renomear TODOS os documentos** para dizer "Zenberry" (CLAUDE.md, README, Swagger title)
- [ ] **Remover references a Scaffold/Dooor/Fonte Imagem**
- [ ] **Remover 6 referências a docs inexistentes** do frontend README
- [ ] **Criar .env.example** no frontend
- [ ] **Tirar package-lock.json do .gitignore**

### FASE 3: TESTES & CI (Semana 4-7)

- [ ] **Corrigir npm test script** no package.json backend
- [ ] **Corrigir e2e config** (rootDir, moduleNameMapper)
- [ ] **Setup Vitest + RTL** no frontend
- [ ] **Escrever testes** para auth flow, product CRUD, chat, cart calculations
- [ ] **Criar CI/CD** basico (lint + type-check + test + build) em ambos repos
- [ ] **Corrigir pre-push hook** (ref `test:pre-push` que nao existe)
- [ ] **Meta:** 30 spec files backend, 20 test files frontend

### FASE 4: ESCALABILIDADE (Semana 8-10)

- [ ] **Adicionar dynamic imports** para ChatbotModal, ReactMarkdown, remark-gfm (~150KB saving)
- [ ] **Otimizar background images** -- mover de CSS para next/image, comprimir PNGs (~20MB saving)
- [ ] **Adicionar `sizes`** em todos os next/image
- [ ] **Adicionar circuit breakers** para Gemini AI (Polly-like pattern)
- [ ] **Adicionar timeouts** em Gemini e Shopify API calls (AbortController)
- [ ] **Configurar connection pooling** no Prisma
- [ ] **Importar e usar CacheModule** (ja implementado, so precisa importar!)
- [ ] **Adicionar virtualizacao** para chat messages e product lists
- [ ] **Remover ReactQueryDevtools** do production bundle (~50KB)

### FASE 5: ARQUITETURA & CLEANUP (Semana 11-14)

- [ ] **Resolver dual product system** -- decidir: Shopify-only ou sync Shopify -> Prisma
- [ ] **Remover dead code** do Scafold (~60% do backend): WebSocket, Multer, Schedule, 14 tokens nao injetados
- [ ] **Vincular ChatTools ao modelo** ou remover dead code de tool-calling
- [ ] **Corrigir Shopify API version mismatch** (backend 2024-01 vs frontend 2023-10)
- [ ] **Remover stale types** do frontend (`User.google_id`, `AskResponse.question`)
- [ ] **Substituir mock data** por dados reais (orders, reviews, original price)
- [ ] **Habilitar strictNullChecks** no backend
- [ ] **Atualizar Prisma** v4.9 -> v6.x
- [ ] **Adicionar `generateMetadata`** em product pages (SEO critico para e-commerce!)
- [ ] **Adicionar JSON-LD, Open Graph, sitemap.xml**
- [ ] **Adicionar error.tsx** em todas as rotas

---

## REPORTS INDIVIDUAIS

| Arquivo | Agente | Dimensao | Score |
|---|---|---|---|
| `agent-1-security-backend.md` | 1 | Seguranca Backend | 5.2/10 |
| `agent-2-security-frontend.md` | 2 | Seguranca Frontend | 6.8/10 |
| `agent-3-quality-backend.md` | 3 | Qualidade Backend | 7.4/10 |
| `agent-4-quality-frontend.md` | 4 | Qualidade Frontend | 7.0/10 |
| `agent-5-tests-backend.md` | 5 | Testes Backend | 1.5/10 |
| `agent-6-tests-frontend.md` | 6 | Testes Frontend | 0.5/10 |
| `agent-7-scalability-backend.md` | 7 | Escalabilidade Backend | 4.5/10 |
| `agent-8-scalability-frontend.md` | 8 | Escalabilidade Frontend | 5.5/10 |
| `agent-9-maintainability-devops.md` | 9 | Manutenibilidade & DevOps | 5.0/10 |
| `agent-10-architecture-domain.md` | 10 | Arquitetura Cross-Cutting | 5.8/10 |
