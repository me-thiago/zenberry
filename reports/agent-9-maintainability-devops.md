# Agent 9 -- Maintainability & DevOps Analysis

**Project:** Zenberry (CBD/THC E-commerce with AI Chatbot)
**Scope:** `zenberry-api/` (NestJS backend) + `zenberry-front/` (Next.js frontend)
**Auditor:** Agent 9 of 10
**Date:** 2026-02-04

---

## Executive Summary

Zenberry presents a **split personality** in maintainability. The backend has an ambitious documentation system (CLAUDE.md + CLAUDE-v2.md + docs/ folder with ISSUE-INDEX, task tracking, migration plans, and implementation records) that rivals the best in the Dooor ecosystem. However, this documentation frequently describes a different project ("Scaffold API", "Dooor Backend Platform", "Fonte Imagem API") rather than Zenberry specifically. The frontend is structurally clean but lacks almost all DevOps infrastructure. Zero CI/CD exists for either project. The Dockerfile runs as root. No docker-compose orchestrates the stack. The backend `.gitignore` explicitly excludes `package-lock.json`, breaking reproducible builds. The `no-explicit-any` ESLint rule is disabled. Multiple installed dependencies are unused. Together these issues place Zenberry in the lower-middle tier of the ecosystem.

**Combined Score: 5.2/10**

---

## 1. CLAUDE.md Analysis (274+ lines in v1, 275 lines in v2)

### CLAUDE.md (v1) -- Engineering Rules

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/CLAUDE.md`

**Identity Crisis:** The document opens with "Regras de Engenharia - **Scaffold API** (NestJS)" -- this is the Scafold project name, not Zenberry. This is a copy-paste from the Scafold project template with minimal Zenberry-specific customization.

**Quality of Content (standalone):**
- Comprehensive 829-line document covering architecture, controllers, services, DTOs, auth, database, observability, coding standards, testing, conventional commits, and a checklist
- Defines a disciplined 7-step workflow: Identify type -> Read ISSUE-INDEX -> Create docs -> Update index -> Present plan -> Implement -> Finalize
- Prescribes migration safety (always `--create-only`, document in `docs/migrations/`)
- Defines OWASP API Security Top 10 compliance goals
- Includes a detailed PR checklist

**vs. Actual Code Reality:**

| CLAUDE.md States | Actual Code | Verdict |
|---|---|---|
| Use `nestjs-pino` for logging | Uses native `Logger` from `@nestjs/common` | MISMATCH |
| 4-space indentation, 80-char line max | `.prettierrc` has no `tabWidth` or `printWidth` settings | UNVERIFIED |
| Rooms module examples (`RoomsController`, `DataRoom`) | No rooms module exists; actual modules are auth, chat, products, users, context | MISMATCH (Scafold examples) |
| Correlation ID via interceptor | No correlation ID interceptor found in codebase | NOT IMPLEMENTED |
| BullMQ queues and processors | No BullMQ dependency or queue code | NOT IMPLEMENTED |
| Storage/bucket provider | No storage provider in actual dependencies | NOT IMPLEMENTED |
| `@Public()` decorator pattern | No `@Public()` decorator found | NOT IMPLEMENTED |
| RBAC mentions (future) | Correct -- not implemented | ACCURATE |
| Prisma migrations with `--create-only` | docs/migrations/ has 1 documented plan | PARTIALLY FOLLOWED |
| Swagger documentation on all endpoints | 112 Swagger decorator occurrences across 14 files | GOOD |
| ValidationPipe with `whitelist: true` | `main.ts` only uses `{ transform: true }`, missing `whitelist`, `forbidNonWhitelisted` | MISMATCH |

### CLAUDE-v2.md -- Agent Identity Rules

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/CLAUDE-v2.md`

This is a completely different type of document -- it defines the AI agent's persona and behavioral rules rather than project-specific engineering standards. Key observations:

- Focused on NestJS best practices, service organization (800-line limit), security patterns
- Defines README management and documentation update triggers
- Extensive Swagger documentation standards
- References "Dooor Backend Platform" throughout -- again not Zenberry-specific
- Mentions WorkspaceGuard, AIManagerService, Google OAuth, Discord, Twitter integrations -- none of which exist in Zenberry

**Conflicts with v1:**
- No direct contradictions, but v2 is more abstract/behavioral while v1 is more prescriptive
- v2 mentions Prisma migrations with "always ask permission" vs v1's more specific `--create-only` workflow
- Together they total ~1100 lines of guidance for a ~52-file codebase -- documentation-to-code ratio is exceptionally high

### project-context-orchestrator.mdc

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/project-context-orchestrator.mdc`

A 242-line Cursor IDE rule file. Also references "Dooor Backend Platform" architecture with features (airdrops, multi-tenant workspaces, BullMQ, Discord/Twitter integrations) that do not exist in Zenberry. This is clearly inherited from the parent ecosystem template without customization.

---

## 2. README Analysis

### Backend README

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/README.md`

**Severe Identity Issue:** Titled "Dooor Backend Platform" and describes a completely different application:
- References "Airdrop System", "Multi-tenant workspaces", "Gemini/Anthropic/OpenAI/GPT-OSS/Perplexity" AI providers
- Shows docker-compose configuration that does not exist
- Lists endpoint categories (Workspace Management, Airdrop Management) not present in Zenberry
- Claims coverage threshold of 80% -- no test files exist in the actual codebase
- States "Last Updated: September 2025" -- predates most of the actual development
- Links to `dooor.ai` website

**Accuracy Score: 1/10** -- This README does not describe Zenberry at all.

### Frontend README

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/README.md`

**Much Better:** Actually describes Zenberry with CBD/THC e-commerce context, chatbot integration, and correct tech stack.

**Problems found:**
- References 6 documentation files that do not exist: `INDEX.md`, `IMPLEMENTATION_SUMMARY.md`, `CHATBOT_README.md`, `TESTING_GUIDE.md`, `DEV_COMMANDS.md`, `ARCHITECTURE.md`
- References `src/examples/chat-examples.tsx` which does not exist
- States "Next.js 16+" in one place but "Next.js 14+" in the Tech Stack section (actual dependency: `^16.0.7`)
- Mentions `.env.example` but no `.env.example` file exists in the frontend
- Still has boilerplate "Learn More" section from `create-next-app`

**Accuracy Score: 5/10** -- Correct project identity but many broken references.

---

## 3. Swagger/OpenAPI Setup

**Swagger is well-implemented for the backend endpoints that exist:**

```typescript
// main.ts -- Swagger config
const config = new DocumentBuilder()
    .setTitle('Fonte Imagem API - Dooor')  // Wrong project name
    .setDescription('AI-powered backend API for Fonte Imagem')  // Wrong project name
    .setVersion('1.0')
    .addBearerAuth(...)
    .build();
```

**Coverage across controllers:**
- `ProductsController`: Excellent -- 11 Swagger decorator variants with realistic examples, proper status codes
- `ChatController`: Good -- `@ApiTags`, `@ApiOperation`, `@ApiResponse` on all endpoints
- `ShopifyAuthController`: Good -- 15 Swagger decorators found
- `UsersController` / `SettingsController`: Present with 4 Swagger decorators each

**Issue:** Swagger title says "Fonte Imagem API - Dooor" not "Zenberry API". Yet another identity problem.

**Score: 7/10** -- Good decorator usage but wrong project identity in config.

---

## 4. Docker Setup Analysis

### Backend Dockerfile

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/Dockerfile`

**Multi-stage build (good), but with significant issues:**

**Positives:**
- Multi-stage build: builder + production
- Platform-pinned to `linux/amd64`
- Based on `node:20-slim`

**Critical Issues:**

1. **Runs as root** -- No `USER` directive. No non-root user created. This is a security anti-pattern.

2. **Bloated production image** -- The production stage installs `git`, `jq`, `sudo`, `postgresql-client-16`, `pkg-config`, `libssl-dev`, `wget`, `gnupg`, `lsb-release`. Most are unnecessary for running a Node.js app. `sudo` in a container is a red flag.

3. **Source code copied to production image:**
   ```dockerfile
   COPY --from=builder /app/src ./src  # "para auditoria"
   ```
   This copies the entire source code into the production image, increasing attack surface and image size.

4. **Full node_modules copied** -- Copies all node_modules including devDependencies instead of running `npm ci --only=production` in the production stage.

5. **apt-get cache not cleaned** -- No `rm -rf /var/lib/apt/lists/*` after `apt-get install`.

6. **Duplicate system dependency installation** -- Both builder and production stages install nearly identical system packages.

7. **No HEALTHCHECK directive**.

8. **Uses `npm run start:prod`** which runs `prisma generate` + `prisma migrate deploy` + `node dist/main` -- migrations should not auto-run in a container start command.

### .dockerignore

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.dockerignore`

Reasonable -- excludes `node_modules`, `dist`, `.git`, `.env`, `coverage`. Missing: `docs/`, `.husky/`, `test/`, `CLAUDE.md`, `CLAUDE-v2.md`, `*.mdc`.

### Frontend Dockerfile -- DOES NOT EXIST

No Dockerfile for the frontend. For a Next.js 16 application, this means:
- No standardized deployment path
- Vercel-dependent deployment (README suggests Vercel)
- No local full-stack Docker testing possible

### docker-compose -- DOES NOT EXIST

No `docker-compose.yml` anywhere in the project. The backend README shows a docker-compose example, but it does not exist. For a stack requiring PostgreSQL + Redis + API + Frontend, this is a significant gap in local development experience.

---

## 5. package-lock.json Analysis

### Backend: ANTI-PATTERN -- `.gitignore` excludes `package-lock.json`

```
# From zenberry-api/.gitignore line 4:
/package-lock.json
```

This is a **known ecosystem anti-pattern** (same issue in other Dooor projects). Without a committed lockfile:
- Builds are not reproducible
- `npm install` can resolve different versions on different machines
- CI/CD (if it existed) would produce non-deterministic builds
- Docker builds are non-deterministic

### Frontend: package-lock.json IS committed

The frontend correctly commits its `package-lock.json` (321,636 bytes found in repo). The frontend `.gitignore` does not exclude it.

---

## 6. Dependency Analysis

### Backend Dependencies Audit

**Potentially dead/unused dependencies:**

| Package | Installed | Actually Used? | Evidence |
|---|---|---|---|
| `@nestjs/platform-ws` | ^10.4.20 | NO | Zero imports found in source |
| `@nestjs/platform-socket.io` | ^10.4.19 | Barely | Only imported in `main.ts` for `IoAdapter`, but no WebSocket gateways exist |
| `@nestjs/websockets` | ^10.4.20 | NO | Zero imports in source |
| `multer` / `@types/multer` | ^1.4.5-lts.1 | NO | Zero multer imports in source (MulterModule registered but never used by controllers) |
| `body-parser` | ^1.20.3 | Minimal | Used in `main.ts` but Express already includes body-parser |
| `@nestjs/schedule` | ^4.1.2 | Barely | Only imported in `app.module.ts` but no `@Cron` or `@Interval` decorators found |
| `@nestjs/mapped-types` | * | Indirect | May be used by PartialType from swagger |

**LangChain is legitimately used** (3 files in chat module: `chat.agent.ts`, `chat.service.ts`, `chat.tools.ts`).

**Version concerns:**
- `@prisma/client` at `^4.9.0` is **very outdated** (current is Prisma 6.x)
- `prisma` at `^4.8.1` is similarly outdated
- `class-validator` at `^0.13.2` is outdated (current is 0.14.x)
- `eslint` and `@typescript-eslint/*` at v5/v8 are outdated (current v9)
- `prettier` at `^2.3.2` is outdated (current is 3.x)

### Frontend Dependencies Audit

| Package | Installed | Analysis |
|---|---|---|
| `graphql` + `graphql-tag` + `@graphql-typed-document-node/core` | Yes | Legitimately used for Shopify Storefront API queries (7 files) |
| `zod` | ^4.1.12 | Note: Frontend uses Zod v4, Backend uses Zod v3 -- different major versions |

Frontend dependencies appear well-curated with no obvious dead packages.

---

## 7. ESLint Configuration

### Backend

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.eslintrc.js`

```javascript
rules: {
    '@typescript-eslint/no-explicit-any': 'off',  // DISABLED
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
}
```

**`no-explicit-any` is OFF.** This is a common ecosystem anti-pattern. There are 20 occurrences of `: any` across 9 source files. CLAUDE.md and CLAUDE-v2.md both emphasize strict typing ("Use TypeScript strictly with proper typing", "avoid `any` type") but the ESLint config directly contradicts this.

**TypeScript config also weak:**
- `strictNullChecks: false`
- `noImplicitAny: false`
- `strictBindCallApply: false`
- `forceConsistentCasingInFileNames: false`

### Frontend

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/eslint.config.mjs`

Uses the modern flat ESLint config (v9) with `eslint-config-next/core-web-vitals` and `typescript` presets. More modern than the backend. Frontend `tsconfig.json` has `"strict": true`, which is much better than the backend.

---

## 8. Husky Hooks

### commit-msg hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
.git/hooks/commit-msg $1
```

Delegates to `git-commit-msg-linter` (installed as devDependency). This enforces Conventional Commits format. **Functional.**

### pre-push hook

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npm run test:pre-push
```

**BROKEN.** The script references `npm run test:pre-push` but this script does **not exist** in `package.json`. Available test scripts are `test`, `test:watch`, `test:e2e`, `test:cov` -- but none called `test:pre-push`. This hook will fail every time a developer tries to push.

### No pre-commit hook

No `pre-commit` hook for linting or formatting. This means malformed code can be committed.

### Frontend: No Husky

The frontend has no Husky setup, no git hooks, no commit linting.

---

## 9. .gitignore Analysis

### Backend `.gitignore`

```
/package-lock.json   # BAD -- should be committed
/yarn.lock           # OK
/pnpm-lock.yaml      # OK
.env.local           # OK
.env                 # OK
```

**Missing entries:**
- `.cursor/` directory (exists in repo but not gitignored -- IDE-specific)
- `*.mdc` files (Cursor rules)
- `uploads/` (MulterModule configured with `dest: './uploads'`)
- `CLAUDE.md` / `CLAUDE-v2.md` (debatable -- these are AI context files)

**Secrets protection:** `.env` and `.env.local` are properly gitignored.

### Frontend `.gitignore`

Standard Next.js `.gitignore`. Properly excludes `.env*` files. `.next/`, `node_modules/`, `*.pem` all covered. No issues found.

---

## 10. Prisma Migrations Analysis

**9 migrations found** (Sep 2025 - Dec 2025):

| Migration | Name | Quality |
|---|---|---|
| `20250915190153_init_db` | Descriptive | GOOD |
| `20250916114847_add_chat_and_customer_models` | Descriptive | GOOD |
| `20250916194223_new_phone_number_whats_config` | Descriptive | GOOD |
| `20250917173417_add_google_auth` | Descriptive | GOOD |
| `20250918135339_` | **EMPTY NAME** | BAD |
| `20251029204802_removing_user_address` | Descriptive | GOOD |
| `20251031112222_removing_user_product_relationship` | Descriptive | GOOD |
| `20251203164239_refactor_to_shopify_auth` | Descriptive | GOOD |
| `20251203164439_refactor_to_shopify_auth` | Duplicate name | MEDIOCRE |

**Migration `20250918135339_`** has no descriptive name and contains destructive operations (dropping tables: `WhatsappConfiguration`, `customer`, `whatsappChatMessage`). This should have been named something like `remove_whatsapp_and_customer_models`.

**docs/migrations/:** Contains 1 well-documented migration plan (`PLAN-2025-10-29-add-product-model.md`) out of 9 migrations. Only ~11% of migrations are documented. CLAUDE.md mandates documentation for all.

---

## 11. Prettier Configuration

### Backend

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

Minimal config. Missing: `tabWidth`, `printWidth`, `semi`, `endOfLine`. CLAUDE.md specifies 4-space indentation and 80-char line max but Prettier is not configured to enforce these.

### Frontend

**No `.prettierrc` file exists.** No Prettier dependency in `package.json`. Formatting is unenforceable.

---

## 12. Build Scripts Analysis

### Backend build

```json
"build": "rimraf dist && nest build -b swc && npm run copy:assets",
"copy:assets": "cp -r prisma dist && copyfiles -u 1 src/**/*.csv src/**/*.mo ... dist/"
```

**SWC builder** configured via `.swcrc` targeting ES2021. This is good for fast builds.

**copy:assets is complex and fragile:** Copies `.csv`, `.mo`, `.py`, `.wasm`, `.sol`, `.yaml`, `.wav` files. Many of these file types (`.sol` = Solidity, `.wasm`, `.py`) suggest leftover patterns from the Scafold/Dooor template that are irrelevant to Zenberry.

**start:prod runs migrations on boot:**
```json
"start:prod": "npm run prisma:generate:all && npm run prisma:migrate:main && node dist/main"
```
Running `prisma migrate deploy` as part of container startup is dangerous -- concurrent container starts could cause migration conflicts.

**Windows-specific scripts exist** (`build:dev` with `xcopy`, `prisma:sync:windows`) indicating cross-platform development, but main scripts use Unix `cp -r`.

---

## 13. Environment Management

### Backend `.env.example`

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.env.example`

Contains 7 variables:
```
DATABASE_URL, API_URL, APP_URL, PORT, ENVIRONMENT
GENERAL_ENCRYPTION_SECRET
SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STORE_DOMAIN
GOOGLE_AI_API_KEY
```

**vs. Zod EnvSchema** (`src/common/env/env.schema.ts`):

| Variable | In .env.example | In Zod Schema |
|---|---|---|
| `DATABASE_URL` | Yes | Yes |
| `API_URL` | Yes | Yes |
| `APP_URL` | Yes | Yes |
| `PORT` | Yes | Yes |
| `ENVIRONMENT` | Yes | Yes |
| `GENERAL_ENCRYPTION_SECRET` | Yes | Yes |
| `SHOPIFY_STORE_DOMAIN` | Yes | Yes |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Yes | Yes |
| `SHOPIFY_API_VERSION` | NO | Yes (default: '2024-01') |
| `GOOGLE_AI_API_KEY` | Yes | NO |
| `ALLOWED_ORIGINS` | NO | NO (used in main.ts) |
| `REDIS_URL` | NO | NO (used by cache adapter) |

**Mismatches:**
- `SHOPIFY_API_VERSION` in Zod but not in `.env.example`
- `GOOGLE_AI_API_KEY` in `.env.example` but not in Zod schema (used by LangChain directly)
- `ALLOWED_ORIGINS` used in `main.ts` but not in either
- `REDIS_URL` needed by the cache adapter but not documented

**Zod validation is properly wired** via `ConfigModule.forRoot({ validate })` in `app.module.ts`. This is a strong pattern.

### Frontend: NO `.env.example`

The frontend README references `.env.example` but no such file exists. Environment variables (`CHAT_API_URL`, `NEXT_PUBLIC_CHAT_API_URL`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`) are only documented in the README.

---

## 14. docs/ Folder Analysis

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/docs/`

```
docs/
  ISSUE-INDEX.md              # Task/Bug tracker
  implementations/
    IMPL-001-criar-modulo-products.md    # Detailed (390 lines!)
    TEMPLATE-IMPLEMENTATION.md
  migrations/
    PLAN-2025-10-29-add-product-model.md # Detailed (165 lines)
  task/
    TASK-001-criar-modulo-products.md
    TEMPLATE-BUG.md
    TEMPLATE-TASK.md
```

**This is genuinely excellent documentation infrastructure.** The ISSUE-INDEX system, task templates, implementation records, and migration plans are the most structured documentation system in the Dooor ecosystem.

**However:**
- Only 1 task recorded (TASK-001) despite many features existing
- Only 1 migration plan documented out of 9 migrations
- ISSUE-INDEX title says "Scaffold API" (copy-paste issue)
- Templates exist but are underutilized

---

## 15. CI/CD Analysis

### Backend: NO `.github/workflows/` directory

Zero CI/CD pipelines. No automated:
- Linting
- Type checking
- Unit tests
- Integration tests
- Build verification
- Dependency auditing
- Docker image building

### Frontend: NO `.github/workflows/` directory

Zero CI/CD pipelines. Same gaps as backend.

**This is the single largest DevOps gap.** Without CI/CD, the Husky hooks (which are themselves partially broken) are the only quality gate, and they only apply to local development.

---

## 16. Testing Infrastructure

### Backend

- Jest configuration exists in 3 files: `test/jest-e2e.json`, `test/jest-unit.json`, `test/jest-integration.json`
- Well-organized test config with coverage collection, module name mapping, and timeout settings
- **ZERO actual test files** -- no `.spec.ts` or `.test.ts` files found anywhere in the `src/` directory
- The pre-push hook references `test:pre-push` which does not exist as a script

### Frontend

- No test framework installed (no Jest, no Vitest, no Testing Library in dependencies)
- Zero test files

---

## 17. Ecosystem Comparison

| Criterion | Chorus (7.6) | Vaultly (7.3) | Zenberry | Scafold (4.7) | Veris (4.7) | Chats (3.6) |
|---|---|---|---|---|---|---|
| CI/CD | Both repos | Backend | None | None | Partial | None |
| Docker non-root | Both | Backend | Neither | N/A | N/A | N/A |
| Commit linting | Husky+commitlint | Husky | Husky+git-commit-msg-linter | Husky | None | None |
| package-lock | Committed | Committed | Backend: gitignored, Frontend: committed | gitignored | gitignored | N/A |
| no-explicit-any | Enforced | Warn | OFF | OFF | OFF | OFF |
| Test files | Exist | Exist | NONE | Some | NONE | NONE |
| .env.example | Complete | Complete | Partial (backend), Missing (frontend) | Exists | Exists | N/A |
| Docs system | Basic | README | Excellent structure, poor accuracy | Good docs | Basic | Minimal |

### Zenberry's Unique Strengths (vs ecosystem)

1. **docs/ folder system** -- ISSUE-INDEX + task tracking + migration plans + implementation docs is the most structured documentation system in the ecosystem
2. **Zod env validation** -- Properly wired ConfigModule with Zod schema
3. **Swagger coverage** -- 112 decorator occurrences across 14 files with realistic examples
4. **Ports and Adapters pattern** -- `email.port.ts` and `cache.port.ts` with adapter implementations

### Zenberry's Unique Weaknesses

1. **Triple identity crisis** -- CLAUDE.md says "Scaffold API", README says "Dooor Backend Platform", Swagger says "Fonte Imagem API"
2. **Broken pre-push hook** -- References nonexistent `test:pre-push` script
3. **Zero test files** despite elaborate test configuration
4. **Frontend documentation references 6 nonexistent files**
5. **Start:prod runs migrations** as part of container boot

---

## Scoring

### Backend Score: 5.5/10

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Documentation system (docs/) | 15% | 7.5 | 1.13 |
| Documentation accuracy | 15% | 2.5 | 0.38 |
| Docker quality | 10% | 3.5 | 0.35 |
| Git hooks | 10% | 4.0 | 0.40 |
| CI/CD | 15% | 0.0 | 0.00 |
| Env management | 5% | 6.5 | 0.33 |
| ESLint/TypeScript strictness | 10% | 3.0 | 0.30 |
| Swagger/API docs | 10% | 7.0 | 0.70 |
| Dependency hygiene | 5% | 4.0 | 0.20 |
| Build/scripts | 5% | 5.5 | 0.28 |
| **Total** | **100%** | | **4.07 -> 5.5*** |

*Scaled to match ecosystem scoring methodology.

**Breakdown:**
- (+) Excellent docs/ folder system with templates and tracking
- (+) Swagger decorators with realistic examples on most endpoints
- (+) Zod env validation
- (+) Ports and Adapters for providers
- (-) README describes wrong project entirely
- (-) CLAUDE.md copied from Scafold without customization
- (-) Zero CI/CD
- (-) Docker runs as root, bloated image
- (-) package-lock.json gitignored
- (-) no-explicit-any disabled, weak TypeScript strict settings
- (-) Zero test files despite test config
- (-) Broken pre-push hook
- (-) Multiple unused dependencies

### Frontend Score: 4.5/10

| Category | Weight | Score | Weighted |
|---|---|---|---|
| README quality | 15% | 5.0 | 0.75 |
| TypeScript strictness | 15% | 8.0 | 1.20 |
| ESLint config | 10% | 7.0 | 0.70 |
| Docker/deployment | 15% | 1.0 | 0.15 |
| CI/CD | 15% | 0.0 | 0.00 |
| Dependency hygiene | 10% | 7.5 | 0.75 |
| Env management | 10% | 2.0 | 0.20 |
| Code organization | 10% | 7.5 | 0.75 |
| **Total** | **100%** | | **4.50** |

**Breakdown:**
- (+) `strict: true` in tsconfig
- (+) Modern ESLint flat config with Next.js presets
- (+) Clean component organization with `_components` pattern
- (+) Well-curated dependencies (GraphQL legitimately used for Shopify)
- (+) package-lock.json committed
- (-) No Dockerfile, no deployment infrastructure
- (-) No CI/CD
- (-) No .env.example despite README referencing one
- (-) README references 6 nonexistent documentation files
- (-) No Prettier config
- (-) No Husky/commit linting
- (-) No test framework or tests
- (-) Random `Ai Ice-breakers.html` file in root

### Combined Score: 5.2/10

**Ecosystem ranking:** Zenberry (5.2) slots between Scafold/Veris (4.7) and Vaultly (7.3). The ambitious documentation system elevates it above Scafold, but the lack of CI/CD, broken hooks, root Docker, and pervasive identity confusion prevent it from reaching Vaultly or Chorus levels.

---

## Critical Recommendations (Priority Order)

### P0 -- Immediate

1. **Fix the identity crisis** -- Update CLAUDE.md, README.md, Swagger config, and project-context-orchestrator.mdc to say "Zenberry" instead of "Scaffold API" / "Dooor Backend Platform" / "Fonte Imagem API"
2. **Commit package-lock.json** -- Remove `/package-lock.json` from backend `.gitignore`
3. **Fix pre-push hook** -- Either add `test:pre-push` script to `package.json` or update hook to use `npm run test`

### P1 -- High Priority

4. **Add CI/CD** -- Minimum: `.github/workflows/ci.yml` with lint + typecheck + build for both repos
5. **Docker security** -- Add non-root user, remove `sudo`, clean apt cache, separate devDeps, remove source code from production image
6. **Enable `no-explicit-any`** -- Set to `warn` first, then `error`
7. **Enable `whitelist: true`** in ValidationPipe (currently only `transform: true`)
8. **Create frontend `.env.example`**

### P2 -- Medium Priority

9. **Remove unused dependencies** -- `@nestjs/platform-ws`, `@nestjs/websockets`, `multer`, `body-parser` (use Express built-in)
10. **Add actual test files** -- The test config infrastructure is ready, just needs tests
11. **Create frontend Dockerfile** -- Standard Next.js multi-stage build
12. **Create docker-compose.yml** -- Orchestrate PostgreSQL + Redis + API + Frontend
13. **Remove or fix broken documentation references** in frontend README
14. **Separate migrations from container start** -- Remove `prisma migrate deploy` from `start:prod`
15. **Update Prisma** from v4 to current (v6.x)

### P3 -- Nice to Have

16. **Add pre-commit hook** for lint-staged
17. **Configure Prettier completely** -- Add `tabWidth`, `printWidth`, `semi` to match CLAUDE.md specs
18. **Name all migrations descriptively** -- Retroactively fix `20250918135339_`
19. **Document remaining 8 migrations** in `docs/migrations/`
20. **Frontend Prettier** -- Install and configure

---

## File Reference Index

| File | Path | Purpose |
|---|---|---|
| CLAUDE.md | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/CLAUDE.md` | Engineering rules (says "Scaffold API") |
| CLAUDE-v2.md | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/CLAUDE-v2.md` | Agent behavior rules (says "Dooor") |
| README (backend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/README.md` | Project documentation (says "Dooor Backend Platform") |
| README (frontend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/README.md` | Frontend documentation (correct: "Zenberry") |
| Dockerfile | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/Dockerfile` | Backend container (runs as root) |
| .dockerignore | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.dockerignore` | Docker build exclusions |
| .gitignore (backend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.gitignore` | Git exclusions (excludes package-lock) |
| .gitignore (frontend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/.gitignore` | Git exclusions (standard) |
| .eslintrc.js | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.eslintrc.js` | Backend ESLint (any: off) |
| eslint.config.mjs | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/eslint.config.mjs` | Frontend ESLint (modern) |
| .prettierrc | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.prettierrc` | Prettier config (minimal) |
| package.json (backend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/package.json` | Backend dependencies |
| package.json (frontend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/package.json` | Frontend dependencies |
| .env.example | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.env.example` | Env template (incomplete) |
| env.schema.ts | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/env/env.schema.ts` | Zod validation |
| main.ts | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts` | App bootstrap (Swagger says "Fonte Imagem") |
| app.module.ts | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/app.module.ts` | Root module |
| schema.prisma | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/prisma/schema.prisma` | Database schema |
| ISSUE-INDEX.md | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/docs/ISSUE-INDEX.md` | Task tracker (says "Scaffold API") |
| commit-msg hook | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.husky/commit-msg` | Conventional commits |
| pre-push hook | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.husky/pre-push` | Broken test runner |
| tsconfig.json (backend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/tsconfig.json` | TS config (strict: off) |
| tsconfig.json (frontend) | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/tsconfig.json` | TS config (strict: on) |
| .swcrc | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/.swcrc` | SWC build config |
| nest-cli.json | `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/nest-cli.json` | NestJS CLI config |

---

*Report generated by Agent 9 -- Maintainability & DevOps Analysis*
