# Agent 5 -- Tests & Coverage Analysis: Zenberry Backend

**Project:** Zenberry API (zenberry-api)
**Auditor:** Agent 5 of 10
**Date:** 2026-02-04
**Scope:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/`
**Codebase:** 52 TypeScript source files, ~4.3K LOC, 5 business modules + infrastructure

---

## Executive Summary

**Score: 1.5 / 10**

Zenberry's backend has **zero test files** written despite having a well-structured Jest configuration across three tiers (unit, integration, e2e). All testing infrastructure is scaffolded and ready -- Jest is installed, configs are thoughtful, devDependencies include `@nestjs/testing` and `supertest` -- but no developer has written a single test. This represents a complete absence of quality assurance for an e-commerce platform handling Shopify OAuth tokens, customer PII, encrypted data, financial transactions (product prices), and an AI-powered chatbot. The codebase is compact enough that reaching meaningful coverage would be a relatively fast effort, making this gap both urgent and achievable to close.

---

## 1. Test File Inventory

### 1.1 Search Results

| Pattern Searched | Files Found |
|---|---|
| `**/*.spec.ts` | 0 |
| `**/*.test.ts` | 0 |
| `**/__tests__/**` | 0 |
| `**/*mock*` | 0 |
| `**/*fixture*` | 0 |
| `**/*seed*` | 0 |
| `**/*factory*` | 0 |

**Verdict:** Confirmed zero test files. Zero mocks, zero fixtures, zero seed data, zero test utilities of any kind.

### 1.2 Test-to-Source Ratio

| Metric | Value |
|---|---|
| Source files (.ts) | 52 |
| Test files | 0 |
| Test/Source ratio | 0.00% |
| Estimated LOC needing coverage | ~3,500 (excluding DTOs, interfaces, modules) |

---

## 2. Jest Configuration Analysis

Three Jest config files exist in `/test/`:

### 2.1 Unit Tests -- `jest-unit.json`

**Quality: GOOD (7/10)**

```json
{
  "testRegex": ".spec.ts$",
  "moduleNameMapper": { "^src/(.*)$": "<rootDir>/src/$1" },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/app.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.interface.ts"
  ],
  "testPathIgnorePatterns": ["/node_modules/", "/dist/", "/test/e2e/", "/test/integration/"]
}
```

**Positives:**
- Proper path alias mapping (`src/` to `<rootDir>/src/$1`) -- tests will resolve imports correctly
- Sensible coverage exclusions: module files, DTOs, entities, interfaces are excluded
- Separate `coverageDirectory` avoids conflicts between tiers
- Ignores e2e and integration test directories

**Issues:**
- Does not exclude `*.port.ts` files (pure interfaces like `CachePort`, `EmailPort`)
- Does not exclude `*.mapper.ts` files (simple transformers that may not warrant direct unit tests)
- Missing `coverageThreshold` -- no minimum coverage enforced

### 2.2 Integration Tests -- `jest-integration.json`

**Quality: GOOD (8/10)**

```json
{
  "testRegex": ".int-spec.ts$",
  "testTimeout": 60000,
  "maxWorkers": 4,
  "forceExit": true,
  "verbose": true,
  "cache": true,
  "transform": { "^.+\\.(t|j)s$": ["ts-jest", { "isolatedModules": true, "diagnostics": { "warnOnly": true } }] }
}
```

**Positives:**
- Distinct file convention (`.int-spec.ts`) prevents accidental mixing with unit tests
- 60-second timeout appropriate for DB/API integration tests
- `isolatedModules: true` for faster compilation
- `forceExit: true` handles hanging connections (Prisma, Redis)
- `maxWorkers: 4` limits concurrency for resource-constrained integration tests

**Issues:**
- Coverage exclusions are less strict than unit config (does not exclude DTOs, entities, interfaces)
- Missing `setupFilesAfterSetup` for database cleanup/teardown

### 2.3 E2E Tests -- `jest-e2e.json`

**Quality: POOR (3/10)**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

**Issues:**
- Minimal NestJS boilerplate -- not customized at all
- Missing `moduleNameMapper` -- path aliases will fail in e2e tests
- Missing timeout configuration -- API tests may hang indefinitely
- No `forceExit` -- connections to Shopify, Redis, Prisma will keep the process alive
- No coverage configuration
- `rootDir` is `.` (the test/ folder) rather than `../` -- will not resolve `src/` imports

---

## 3. Package.json Scripts Analysis

### 3.1 Test Scripts

**There are ZERO test scripts in package.json.**

The `scripts` section contains 14 entries for build, start, Prisma, and copy operations, but none for testing:

- No `test` script
- No `test:unit` script
- No `test:integration` script
- No `test:e2e` script
- No `test:cov` script

This means:
- `npm test` will fail with "missing script: test"
- CI/CD cannot run tests without manual configuration
- The Jest configs exist but have no entry point via npm scripts

### 3.2 Testing devDependencies

All necessary packages ARE installed:

| Package | Version | Status |
|---|---|---|
| `jest` | 29.3.1 | Installed |
| `ts-jest` | 29.0.3 | Installed |
| `@types/jest` | 29.2.4 | Installed |
| `@nestjs/testing` | ^10.4.4 | Installed |
| `supertest` | ^6.1.3 | Installed |
| `@types/supertest` | ^2.0.11 | Installed |

**Verdict:** The tooling is ready. The gap is purely in execution -- no one has written tests or wired up the npm scripts.

---

## 4. Coverage Exclusion Analysis

From `jest-unit.json`'s `collectCoverageFrom`:

| Excluded Pattern | Count of Files Matching | Appropriate? |
|---|---|---|
| `*.module.ts` | 10 (app, prisma, shopify, auth, users, products, chat, context, cache, email) | Yes -- DI wiring |
| `main.ts` | 1 | Yes -- bootstrap |
| `app.module.ts` | 1 (redundant with *.module.ts) | Redundant but harmless |
| `*.dto.ts` | 7 | Yes -- declarative validation |
| `*.entity.ts` | 0 (project uses Prisma, not entities) | N/A |
| `*.interface.ts` | 2 | Yes -- pure type definitions |

**Missing exclusions:**
- `*.port.ts` (2 files: `cache.port.ts`, `email.port.ts`) -- pure interfaces
- `injection-tokens.ts` -- constants only
- `*.mapper.ts` (1 file: `user.mapper.ts`) -- debatable, simple enough to test but also simple enough to exclude

**Files that SHOULD be covered but aren't (because nothing is covered):**
- 7 services (ShopifyAuthService, ChatService, ChatAgent, ChatProductsService, ContextService, ProductsService, UsersService, UsersSettingsService)
- 5 controllers
- 4 utilities (encrypt, decrypt, lexical, timezone)
- 1 guard (ShopifyJwtGuard)
- 1 middleware (RequestContextMiddleware)
- 1 Redis adapter
- 1 Resend email adapter
- 1 env schema validator

---

## 5. Module-by-Module Testability Analysis

### 5.1 Auth/Shopify Module

**Files:** `shopify-auth.service.ts` (334 LOC), `shopify-auth.controller.ts` (100 LOC), `shopify-jwt.guard.ts` (35 LOC), `shopify-client.service.ts` (36 LOC)
**Testability: MODERATE**
**Priority: CRITICAL**

**Dependency Injection:** Uses NestJS DI properly. `ShopifyAuthService` depends on `PrismaService` and `ShopifyClientService`, both injectable and mockable.

**Mockability Assessment:**
- `ShopifyClientService.query()` can be mocked to return fake GraphQL responses -- this is the main external dependency
- `PrismaService` mockable via `@nestjs/testing` overrides
- `bcrypt.hash/compare` can be mocked or allowed to run (fast enough for unit tests)

**Critical Untested Paths:**
1. **Token validation flow in `getCurrentCustomer()`** -- iterates ALL users and bcrypt-compares tokens. This is O(n) and a security-sensitive path. Tests must verify correct token matches, expired token rejection, and null token handling.
2. **Register flow** -- must verify Shopify GraphQL error propagation, rate limit detection, customer creation, token hashing, and DB persistence.
3. **Login flow** -- upsert logic (create vs update) needs coverage.
4. **Logout flow** -- Shopify token deletion + local DB cleanup.
5. **Guard (`ShopifyJwtGuard`)** -- Bearer token extraction, missing header handling, invalid token flow.

**Design Issue Found:** `getCurrentCustomer()` loads ALL users from DB and iterates with bcrypt.compare. This is a performance bug that testing would have caught. With 1000 users, this would be extremely slow.

### 5.2 Chat/AI Module

**Files:** `chat.service.ts` (157 LOC), `chat.agent.ts` (203 LOC), `chat.tools.ts` (166 LOC), `chat-products.service.ts` (225 LOC), `chat.controller.ts` (127 LOC)
**Testability: HIGH for service, LOW for agent**
**Priority: HIGH**

**Mockability Assessment:**
- `ChatService` -- excellent testability. Private methods (`sanitizeInput`, `validateInput`, `isLowQuality`) are called through `ask()`, which is easily testable by mocking `ChatAgent`.
- `ChatAgent` -- harder to unit test due to `ChatGoogleGenerativeAI` initialization in constructor. The model is created eagerly, not injected. Would need constructor-level mocking.
- `ChatTools` -- fully testable. Each tool is a standalone function returning `DynamicStructuredTool`. `ContextService` and `ChatProductsService` are injectable.
- `ChatProductsService` -- testable via mocked `ShopifyClientService`. Caching logic (TTL, stale cache fallback) is important to test.

**Critical Untested Paths:**
1. **Input sanitization** (`sanitizeInput`) -- HTML tag removal, length truncation. Needs tests for XSS vectors, edge cases (empty string, exactly 2000 chars, unicode).
2. **Spam detection** (`validateInput`) -- regex patterns for repeated chars and URLs. Tests must verify detection accuracy and false positive rate.
3. **Low quality response detection** (`isLowQuality`) -- regex patterns. Must verify it catches "sim", "nao", short responses, but not valid short answers.
4. **History validation** (`validateHistory`) -- array structure validation.
5. **Product cache TTL logic** -- 5-minute cache, stale cache fallback on error.
6. **Streaming flow** -- SSE endpoint with async generator.
7. **Dosage calculator** -- medical-adjacent feature in a CBD e-commerce platform. Must be tested to ensure no irresponsible dosage recommendations.

### 5.3 Products Module

**Files:** `products.service.ts` (212 LOC), `products.controller.ts` (353 LOC, mostly Swagger)
**Testability: HIGH**
**Priority: MEDIUM-HIGH**

**Mockability Assessment:**
- Pure Prisma CRUD -- `PrismaService` easily mockable
- `Decimal` conversion from `@prisma/client/runtime/library` is straightforward
- No external API calls

**Critical Untested Paths:**
1. **CRUD operations** -- standard but important. Create, update, delete, findAll, findOneById.
2. **Price Decimal conversion** -- `new Decimal(createProductDto.price)` could throw on invalid input.
3. **Product not found** -- NotFoundException for missing products.
4. **Authorization gap** -- Controller has no `@UseGuards()` decorator! Products endpoints appear completely unprotected. No auth required for create, update, delete. This is a critical security finding that tests would have caught.

### 5.4 Context Module

**Files:** `context.service.ts` (166 LOC)
**Testability: HIGH**
**Priority: MEDIUM**

**Mockability Assessment:**
- File system dependency (`fs/promises.readFile`) -- mockable via `jest.mock('fs/promises')`
- Or, integration test with actual data files (6 .md files exist in `data/` directory)
- `OnModuleInit` lifecycle hook needs special handling in tests

**Critical Untested Paths:**
1. **Context loading** -- file reading, concatenation, caching.
2. **Product search** (`searchProducts`) -- keyword matching across markdown blocks. Complex string parsing logic.
3. **Section extraction** (`getInfoSection`) -- finds sections by name in cached content.
4. **Graceful degradation** -- individual file load failures should log warnings, not crash.
5. **Cache reload** -- `reloadContext()` should replace cached data.

### 5.5 Users Module

**Files:** `users.service.ts` (36 LOC), `settings.service.ts` (162 LOC), `user.mapper.ts` (22 LOC)
**Testability: HIGH**
**Priority: MEDIUM**

**Mockability Assessment:**
- `UsersService` -- simple Prisma find by ID, trivially testable.
- `UsersSettingsService` -- more complex. Updates both Shopify (via GraphQL) and local DB. Handles token rotation from Shopify.
- `UserMapper` -- static method, trivially testable.

**Critical Untested Paths:**
1. **Settings update with token rotation** -- Shopify may return new access tokens during customer update. This rotation logic is security-critical.
2. **Email uniqueness check** -- race condition potential between check and update.
3. **Empty update rejection** -- "No fields to update" path.

---

## 6. Infrastructure & Utility Testability

### 6.1 Encryption Utilities

**Files:** `encrypt.util.ts` (7 LOC), `decrypt.util.ts` (9 LOC)
**Testability: HIGH**
**Priority: CRITICAL**

```typescript
export const encrypt = (data: string | null | undefined) => {
  if (!data) return data;
  const key = process.env.GENERAL_ENCRYPTION_SECRET;
  return CryptoJS.AES.encrypt(data, key).toString();
}
```

**Issues:**
- Reads `process.env.GENERAL_ENCRYPTION_SECRET` directly (not injected) -- testable by setting env var in test setup
- Null/undefined passthrough is important to test
- **No key validation** -- if `GENERAL_ENCRYPTION_SECRET` is undefined, CryptoJS will use `undefined` as key. This would silently produce encrypted data that cannot be properly decrypted.
- Roundtrip test (encrypt then decrypt) is essential

### 6.2 Redis Cache Adapter

**File:** `redis.cache.adapter.ts` (202 LOC)
**Testability: MODERATE (needs Redis mock or testcontainers)**
**Priority: MEDIUM**

Well-structured with proper error handling, edge cases (empty keys, undefined values), and serialization. Good candidate for integration tests with ioredis-mock.

### 6.3 Resend Email Adapter

**File:** `resend.email.adapter.ts` (109 LOC)
**Testability: HIGH**
**Priority: LOW-MEDIUM**

Has retry logic with exponential backoff (4 attempts, 300ms-3s). `axios` easily mockable. Good test candidate for retry behavior verification.

### 6.4 Timezone Utilities

**File:** `timezone.util.ts` (177 LOC)
**Testability: HIGH**
**Priority: LOW**

Pure functions with no external dependencies. `isValidTimezone`, `normalizeTimezone`, `getTimezoneOffset` are all trivially testable. Low priority because timezone logic doesn't appear to be used in core business flows.

### 6.5 Lexical Utilities

**File:** `lexical.util.ts` (99 LOC)
**Testability: HIGH (but has a bug)**
**Priority: LOW-MEDIUM**

**Bug Found:** Uses `this.walkLexicalNode(child)` inside `walkLexicalNode` and `lexicalToText`, but these are exported standalone functions, not class methods. `this` will be `undefined` at runtime when called from a module import. This would cause a runtime crash that tests would have caught immediately.

### 6.6 Custom Validators

**File:** `custom-validators.ts` (65 LOC)
**Testability: HIGH**
**Priority: LOW**

`IsNotBlank` and `IsValidTag` are simple regex validators. Easily testable with direct class instantiation.

### 6.7 Env Schema

**File:** `env.schema.ts` (20 LOC)
**Testability: HIGH**
**Priority: LOW-MEDIUM**

Zod schema validation. Can test with valid/invalid env objects to ensure proper rejection of misconfigured deployments.

---

## 7. Critical Untested Paths -- Consolidated Risk Matrix

| # | Path | Severity | Exploitability | Module |
|---|---|---|---|---|
| 1 | **Products CRUD has NO auth guard** | CRITICAL | Immediate | Products |
| 2 | **Shopify OAuth token storage & validation** | CRITICAL | Medium | Auth |
| 3 | **Encrypt/decrypt with missing env key** | CRITICAL | Medium | Utils |
| 4 | **getCurrentCustomer O(n) bcrypt scan** | HIGH | Performance DoS | Auth |
| 5 | **Lexical util `this` reference bug** | HIGH | Runtime crash | Utils |
| 6 | **Chat input sanitization bypass** | HIGH | Medium (XSS) | Chat |
| 7 | **Spam detection false negatives** | MEDIUM | Low | Chat |
| 8 | **Product cache stale data** | MEDIUM | Low | Chat |
| 9 | **Settings token rotation handling** | MEDIUM | Token theft | Users |
| 10 | **Dosage calculator accuracy** | MEDIUM | Regulatory risk | Chat |
| 11 | **Redis adapter connection failure** | MEDIUM | Service degradation | Infra |
| 12 | **Email retry exhaustion** | LOW | Email delivery | Infra |

---

## 8. Complexity Analysis -- Test Priority by Service

Services ranked by cyclomatic complexity and business criticality:

| Rank | Service | Est. LOC | Complexity | External Deps | Test Priority |
|---|---|---|---|---|---|
| 1 | `ShopifyAuthService` | 334 | High | Shopify GraphQL, Prisma, bcrypt | **P0 -- CRITICAL** |
| 2 | `ChatService` | 157 | Medium-High | ChatAgent (Gemini) | **P0 -- CRITICAL** |
| 3 | `ChatProductsService` | 225 | Medium | Shopify GraphQL, ConfigService | **P1 -- HIGH** |
| 4 | `UsersSettingsService` | 162 | Medium | Shopify GraphQL, Prisma, bcrypt | **P1 -- HIGH** |
| 5 | `ContextService` | 166 | Medium | File System | **P1 -- HIGH** |
| 6 | `ProductsService` | 212 | Low-Medium | Prisma | **P2 -- MEDIUM** |
| 7 | `ChatAgent` | 203 | High | Gemini AI, LangChain | **P2 -- MEDIUM** |
| 8 | `RedisCacheAdapter` | 202 | Medium | Redis | **P2 -- MEDIUM** |
| 9 | `encrypt.util` / `decrypt.util` | 16 | Low | CryptoJS | **P0 -- CRITICAL** (small but security-critical) |
| 10 | `ShopifyJwtGuard` | 35 | Low | ShopifyAuthService | **P1 -- HIGH** |
| 11 | `UsersService` | 36 | Low | Prisma | **P3 -- LOW** |
| 12 | `ResendEmailAdapter` | 109 | Medium | Axios/Resend API | **P3 -- LOW** |

---

## 9. Proposed Testing Strategy

### Phase 1: Foundation (Estimated 1-2 days)

**Goal:** Get the testing infrastructure running and cover security-critical pure functions.

1. **Add npm scripts to `package.json`:**
   ```json
   "test": "jest --config test/jest-unit.json",
   "test:watch": "jest --config test/jest-unit.json --watch",
   "test:cov": "jest --config test/jest-unit.json --coverage",
   "test:int": "jest --config test/jest-integration.json",
   "test:e2e": "jest --config test/jest-e2e.json"
   ```

2. **Fix `jest-e2e.json`:** Add `moduleNameMapper`, `rootDir: "../"`, `forceExit`, `testTimeout`.

3. **Write unit tests for utilities (8-10 tests):**
   - `encrypt.util.spec.ts` -- roundtrip, null handling, missing key
   - `decrypt.util.spec.ts` -- valid decryption, tampered data, missing key
   - `timezone.util.spec.ts` -- validation, normalization, aliases
   - `custom-validators.spec.ts` -- IsNotBlank, IsValidTag

4. **Write unit tests for ChatService (12-15 tests):**
   - Input sanitization (HTML stripping, truncation, empty input)
   - Input validation (too short, too long, spam patterns, URLs)
   - Low quality detection
   - History validation
   - Fallback response

### Phase 2: Core Business Logic (Estimated 2-3 days)

**Goal:** Cover the Shopify auth flow and product CRUD.

5. **ShopifyAuthService tests (15-20 tests):**
   - Mock `ShopifyClientService.query()` for all GraphQL operations
   - Register: success, Shopify error, rate limit, missing customer
   - Login: success, invalid credentials, upsert create vs update
   - getCurrentCustomer: valid token, invalid token, expired token
   - Logout: success, user not found, Shopify deletion error

6. **ShopifyJwtGuard tests (5-8 tests):**
   - Valid Bearer token, missing auth header, non-Bearer scheme, invalid token

7. **ProductsService tests (10-12 tests):**
   - CRUD operations, not found handling, Decimal conversion, pagination

8. **UsersSettingsService tests (8-10 tests):**
   - Update success, email uniqueness, token rotation, empty update, Shopify error

### Phase 3: AI/Chat Layer (Estimated 2-3 days)

**Goal:** Cover the chatbot pipeline with mocked AI.

9. **ChatProductsService tests (8-10 tests):**
   - Product fetching, caching (TTL, stale fallback), search with keywords, empty results

10. **ContextService tests (8-10 tests):**
    - Context loading from files, missing file handling, search, section extraction, cache info

11. **ChatTools tests (5-8 tests):**
    - Each tool function with mocked dependencies, dosage calculator edge cases

12. **ChatAgent tests (5-8 tests):**
    - Mock `ChatGoogleGenerativeAI` model, verify prompt construction, history slicing

### Phase 4: Integration & E2E (Estimated 3-5 days)

13. **Integration tests with Prisma:**
    - Use test database or Prisma mock for actual query testing
    - Auth flow end-to-end with mocked Shopify but real DB

14. **E2E tests:**
    - Full HTTP request lifecycle through NestJS test module
    - Chat endpoint with mocked AI
    - Product CRUD with authentication (once auth guard is added)

### Estimated Outcome

| Phase | Tests Added | Est. Coverage |
|---|---|---|
| Phase 1 | ~35 tests | ~15% |
| Phase 2 | ~45 tests | ~50% |
| Phase 3 | ~35 tests | ~70% |
| Phase 4 | ~25 tests | ~80% |
| **Total** | **~140 tests** | **~80%** |

---

## 10. Ecosystem Comparison

| Project | Test Files | Test/File Ratio | Config Quality | Score |
|---|---|---|---|---|
| **Vaultly** | 62 | 14.4% | Good | 7.0/10 |
| **Veris** | 6 | 0.99% | Moderate | 3.2/10 |
| **Zenberry** | **0** | **0.00%** | **Good configs, zero execution** | **1.5/10** |
| **Chats** | 2 | 0.48% | Minimal | 1.5/10 |
| **Chorus** | 2 | 0.67% | Minimal | 1.2/10 |
| **Scafold** | 0 | 0.00% | None (Jest installed, unconfigured) | 1.0/10 |

### Why 1.5 and not 1.0?

Zenberry scores above Scafold because:
1. **Three well-structured Jest configs** exist (unit, integration, e2e) with proper conventions
2. **Coverage exclusion patterns** are thoughtful and reflect NestJS best practices
3. **All testing devDependencies** are installed (`@nestjs/testing`, `supertest`, `ts-jest`)
4. **The integration config** has production-quality settings (timeout, maxWorkers, forceExit, isolatedModules)
5. **The codebase is well-structured for testing** -- proper DI, injectable services, clear separation of concerns

### Why not higher than 1.5?

1. **Zero tests = zero confidence.** Configs without tests are like buying a gym membership and never going.
2. **No npm test scripts** -- configs are disconnected from the development workflow.
3. **E2E config is broken** (wrong rootDir, missing moduleNameMapper).
4. **No mocks, fixtures, or seed data** -- testing infrastructure is incomplete beyond configs.
5. **Critical security paths are completely untested** in an e-commerce platform handling financial data and PII.

---

## 11. Bugs & Issues Discovered During Audit

Testing audits often reveal bugs through careful code review. The following were found:

### 11.1 CRITICAL: Products Endpoints Have No Authentication

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/products/controllers/products.controller.ts`

The `ProductsController` has NO `@UseGuards()` decorator. All CRUD operations (create, update, delete) are publicly accessible. Compare with `ShopifyAuthController` which properly uses `@UseGuards(ShopifyJwtGuard)` on protected endpoints. A test asserting 401 on unauthenticated product creation would have caught this immediately.

### 11.2 HIGH: O(n) Token Lookup by bcrypt Comparison

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/auth/shopify/shopify-auth.service.ts` (lines 217-229, 258-270)

`getCurrentCustomer()` and `logout()` load ALL users from the database, then iterate with `bcrypt.compare()` to find the matching token. With bcrypt's intentional slowness (~100ms per comparison), this becomes O(n * 100ms). At 100 users, that is a 10-second response time. A performance test would have flagged this.

### 11.3 HIGH: Lexical Util Uses `this` in Standalone Functions

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/lexical.util.ts` (lines 22, 41, 47)

`walkLexicalNode` and `lexicalToText` are exported as standalone functions but call `this.walkLexicalNode(child)`. When imported as module functions, `this` is `undefined`, causing a runtime TypeError. A single unit test calling these functions would have caught this immediately.

### 11.4 MEDIUM: Encrypt/Decrypt with Undefined Key

**Files:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/encrypt.util.ts`, `decrypt.util.ts`

Both utilities read `process.env.GENERAL_ENCRYPTION_SECRET` at call time. If the env var is not set, `key` will be `undefined`. CryptoJS.AES will still "encrypt" data with an undefined passphrase, producing data that decrypts differently depending on whether the key is later set. No validation, no early failure.

---

## 12. Scoring Breakdown

| Criterion | Weight | Score | Weighted |
|---|---|---|---|
| Test file existence | 25% | 0/10 | 0.00 |
| Test infrastructure (Jest configs, deps) | 15% | 7/10 | 1.05 |
| npm script integration | 10% | 0/10 | 0.00 |
| Coverage configuration | 10% | 6/10 | 0.60 |
| Mock/fixture availability | 10% | 0/10 | 0.00 |
| Critical path coverage | 20% | 0/10 | 0.00 |
| Testability of architecture | 10% | 8/10 | 0.80 |
| **Total** | **100%** | | **1.45 -> 1.5/10** |

---

## 13. Key Recommendations (Priority Order)

1. **IMMEDIATE:** Add `@UseGuards(ShopifyJwtGuard)` to `ProductsController` for write operations (create, update, delete).

2. **IMMEDIATE:** Fix `lexical.util.ts` -- replace `this.walkLexicalNode` with `walkLexicalNode` (direct function call).

3. **WEEK 1:** Add npm test scripts, fix e2e config, write Phase 1 tests (utilities + ChatService sanitization).

4. **WEEK 2:** Write Phase 2 tests (ShopifyAuthService, guard, products). Fix the O(n) token lookup by storing a searchable token hash or using JWT.

5. **WEEK 3:** Write Phase 3 tests (chat pipeline with mocked AI). Add key validation to encrypt/decrypt utils.

6. **MONTH 1:** Add integration tests with test database. Set up CI pipeline to run tests on every PR.

7. **ONGOING:** Add `coverageThreshold` to jest-unit.json:
   ```json
   "coverageThreshold": { "global": { "branches": 70, "functions": 80, "lines": 80, "statements": 80 } }
   ```

---

**Final Score: 1.5 / 10**

The Zenberry backend has a well-architected codebase with proper NestJS patterns and good testing infrastructure scaffolding, but zero actual test coverage. For an e-commerce platform handling OAuth tokens, encrypted PII, financial data, and an AI chatbot dispensing CBD dosage advice, this represents unacceptable risk. The silver lining is that the small codebase size (~4.3K LOC) and clean architecture mean that achieving 80% coverage is a realistic 2-3 week effort.
