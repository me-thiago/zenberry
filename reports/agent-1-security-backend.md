# Agent 1: Security Analysis of the Backend

**Project:** Zenberry API (zenberry-api)
**Scope:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/`
**Auditor:** Agent 1 (Security Backend Focus)
**Date:** 2026-02-04
**Codebase Size:** ~52 source files, ~4.3K LOC (NestJS + Prisma + LangChain)

---

## Overall Score: 5.2 / 10

### Sub-Dimension Breakdown

| Dimension | Score | Weight | Notes |
|---|---|---|---|
| Authentication & Authorization | 4.5/10 | 25% | Shopify OAuth delegated but bcrypt-scan is O(N), unprotected CRUD |
| Encryption & Secrets Management | 4.0/10 | 20% | CryptoJS AES weak mode, process.env bypasses ConfigService |
| Input Validation & Sanitization | 6.5/10 | 15% | Good DTO validation, but missing whitelist/forbidNonWhitelisted |
| API Security (Headers/CORS/Rate Limiting) | 4.0/10 | 15% | No Helmet, CORS dual-config issue, rate limiting present but basic |
| AI/LLM Security (Prompt Injection) | 5.0/10 | 10% | Basic sanitization present, no prompt injection defenses |
| Data Protection & Access Control | 5.5/10 | 10% | bcrypt on tokens, soft delete on User, but no RBAC at all |
| Infrastructure & Dependencies | 6.0/10 | 5% | Zod env validation, Docker multi-stage, but outdated Prisma |

---

## Executive Summary

Zenberry is a small but focused CBD/THC e-commerce backend (~4.3K LOC, 52 files) built on NestJS with Shopify Storefront API integration for authentication and product data, plus a LangChain-powered AI chatbot for customer support. Its smaller codebase relative to Dooor ecosystem siblings (Scafold 5.1K, Vaultly 6.2K, Veris 4.3K, Chorus 5.0K) does translate to a reduced attack surface -- notably, several ecosystem-wide vulnerabilities (admin bypass token, ApiKeyGuard disabled, BullBoard hardcoded password) are **absent** from Zenberry. This is a meaningful positive differentiator.

However, the project inherits the Dooor ecosystem's most pervasive weaknesses: **CryptoJS AES in weak passphrase mode** (no explicit IV, no key derivation), **zero Helmet/security headers**, **direct process.env access** bypassing NestJS ConfigService, and a **ValidationPipe without whitelist/forbidNonWhitelisted** settings. The most architecturally significant finding is a **critical O(N) full-table scan with bcrypt comparison** on every authenticated request, which is both a performance disaster and a denial-of-service vector. Additionally, the **Products CRUD endpoints and Users GET endpoint have zero authentication guards** -- anyone can create, update, delete, and list products and users without any token. The AI chatbot endpoint is also fully public with no authentication, and while it has basic input sanitization, it lacks prompt injection defenses that would be important for a RAG system feeding product data to an LLM.

The Shopify OAuth integration itself is well-designed: passwords never touch the backend (delegated entirely to Shopify), tokens are bcrypt-hashed before database storage, and logout properly revokes tokens both on Shopify and locally. CORS configuration, while having a dual-initialization issue, defaults to a restrictive localhost whitelist rather than the wildcard `*` pattern seen in most ecosystem siblings. The rate limiting (ThrottlerGuard at 30 requests/30 seconds) is globally applied, and Zod-validated environment schema is a positive pattern. These strengths prevent this from being a critically low score, but the unprotected admin endpoints and O(N) auth scan require urgent attention.

---

## Detailed Findings

### CRITICAL Severity

#### C-01: Products CRUD Endpoints Completely Unprotected (No Authentication)

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/products/controllers/products.controller.ts`

The entire Products controller -- including `POST` (create), `PATCH` (update), and `DELETE` operations -- has **no `@UseGuards(ShopifyJwtGuard)` decorator** at either the class or method level. Any unauthenticated user can create, modify, or delete products.

```typescript
// products.controller.ts - NO guard at class or method level
@ApiTags('Products')
@Controller('products')
export class ProductsController {
    // ...
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
        await this.productsService.delete(id);
    }
}
```

The Swagger documentation even mentions "Only the owner can update/delete their products" and references `@ApiUnauthorizedResponse`, but the actual guards are not applied. This is a documentation-reality mismatch that creates a false sense of security.

**Impact:** Any internet user can manipulate the product catalog -- creating spam products, modifying prices, or deleting all products. For an e-commerce platform, this is catastrophic.

---

#### C-02: Users GET Endpoint Unprotected (No Authentication Guard)

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/users/controllers/users.controller.ts`

The `GET /users` endpoint accesses `req.user.id` but has **no `@UseGuards(ShopifyJwtGuard)`** decorator. The middleware `RequestContextMiddleware` sets `cls.userId` from `(req as any).user?.id`, but this value is only populated when `ShopifyJwtGuard` runs first. Without the guard, `req.user` is undefined, and the endpoint will throw a runtime error rather than a clean 401.

```typescript
@Controller('users')
export class UsersController {
    @Get()
    // NO @UseGuards(ShopifyJwtGuard)
    async getUser(@Req() req: Request & { user: any }, @Res() res: Response): Promise<void> {
        const userId = req.user.id; // Will be undefined without guard
        // ...
    }
}
```

**Impact:** While this likely results in a 500 error rather than data exposure (because `req.user` is undefined), it's still a missing authentication guard that should be there for defense-in-depth. If any middleware or proxy ever sets a `user` property on the request, it would bypass intended auth.

---

#### C-03: O(N) Full-Table Scan with bcrypt on Every Authenticated Request

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/auth/shopify/shopify-auth.service.ts` (lines 216-229, 257-270)

The `getCurrentCustomer` and `logout` methods load **ALL users from the database** and iterate with `bcrypt.compare` to find the matching token. bcrypt is intentionally slow (~100ms per comparison at cost factor 10). This creates:

1. **O(N) time complexity per authenticated request** -- with 1,000 users, every auth check takes ~100 seconds
2. **Denial-of-service vector** -- a flood of requests with invalid tokens forces full-table bcrypt scans
3. **Linear degradation** -- performance degrades as the user base grows

```typescript
async getCurrentCustomer(token: string) {
    // Loads ALL users from database
    const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
    });

    let user = null;
    for (const u of users) {
        // bcrypt.compare is ~100ms per call
        if (u.shopifyAccessToken && await bcrypt.compare(token, u.shopifyAccessToken)) {
            user = u;
            break;
        }
    }
    // ...
}
```

The `ShopifyJwtGuard.canActivate()` calls `getCurrentCustomer()` on every guarded request, making this the critical path.

**Impact:** This is both a severe performance issue and a DoS vulnerability. The system becomes unusable with even a moderate number of users.

---

### HIGH Severity

#### H-01: CryptoJS AES in Weak Passphrase Mode (No Explicit IV, No KDF)

**Files:**
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/encrypt.util.ts`
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/decrypt.util.ts`

CryptoJS.AES.encrypt with a string passphrase uses OpenSSL's `EVP_BytesToKey` key derivation with a random salt but **MD5-based KDF, no HMAC authentication, and CBC mode by default**. This is the same weak pattern found in Scafold and Chorus.

```typescript
// encrypt.util.ts
import * as CryptoJS from 'crypto-js';
export const encrypt = (data: string | null | undefined) => {
  if (!data) return data;
  const key = process.env.GENERAL_ENCRYPTION_SECRET;
  return CryptoJS.AES.encrypt(data, key).toString(); // Passphrase mode, MD5-based KDF
}
```

**Key issues:**
- MD5-based key derivation (EVP_BytesToKey) is cryptographically weak
- No authenticated encryption (no HMAC/GCM), vulnerable to bit-flipping
- No explicit IV control
- `GENERAL_ENCRYPTION_SECRET` minimum length is only 1 character in env validation

Note: The encrypt/decrypt utilities are defined but appear **unused** in the current codebase -- Shopify tokens are stored with bcrypt instead. However, their presence suggests intended future use.

**Impact:** If these utilities are used for any sensitive data encryption, the cryptographic guarantees are insufficient. The weak KDF and lack of authentication make ciphertext malleable.

---

#### H-02: Zero Security Headers (No Helmet)

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts`

The application does not use Helmet or any equivalent security header middleware. `helmet` is not even in `package.json` dependencies. This means **no** X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy, or any other standard security headers.

```typescript
// main.ts - No helmet import, no helmet usage
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  // ... no app.use(helmet()) anywhere
}
```

The project's own `CLAUDE.md` documentation prescribes "Use Helmet, CORS adequado" under API8:2023 Security Misconfiguration, indicating awareness but non-implementation.

**Impact:** Missing security headers expose the application to clickjacking, MIME-type sniffing, and other browser-based attacks. This is a Dooor ecosystem-wide pattern.

---

#### H-03: Chat Endpoint Fully Public -- No Authentication

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.controller.ts`

The `POST /chat/ask` and `POST /chat/stream` endpoints have no `@UseGuards` decorator. Any anonymous user can send messages to the AI chatbot, which triggers Shopify API calls (product fetches) and Google AI API calls.

```typescript
@Controller('chat')
export class ChatController {
    @Post('ask')
    // NO guard
    async ask(@Body() dto: AskQuestionDto): Promise<ChatResponseDto> {
        // Calls Google AI API + Shopify API
    }

    @Post('stream')
    // NO guard
    streamChat(@Body() dto: AskQuestionDto): Observable<MessageEvent> {
        // Calls Google AI API + Shopify API
    }
}
```

While the ThrottlerGuard applies globally at 30 req/30s, this still allows:
- **Cost abuse** -- each request invokes Google AI API (billing)
- **Shopify API rate limit exhaustion** -- each request may fetch products
- **Information gathering** -- product catalog and company data exposed via chatbot

**Impact:** Unauthenticated access to an expensive AI endpoint creates financial risk and potential abuse. The 30/30s rate limit is insufficient for an endpoint that costs money per call.

---

#### H-04: CORS Dual-Initialization -- `cors: true` Then Override

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts`

CORS is configured twice: first with `{ cors: true }` (wildcard `*`) during app creation, then with a more restrictive `enableCors()` call:

```typescript
// Line 11: FIRST -- enables CORS with wildcard (*)
const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

// Lines 20-25: SECOND -- attempts to restrict origins
app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
});
```

The `enableCors()` call **should** override the initial `cors: true`, but the dual initialization is error-prone. If `ALLOWED_ORIGINS` env var is not set, it defaults to localhost origins, which is reasonable. However, the `{ cors: true }` in the factory creates a brief window where wildcard CORS is active during startup.

**Impact:** While the override likely works, the pattern creates maintenance risk. The `ALLOWED_ORIGINS` env var is not in the Zod `EnvSchema`, meaning it's not validated.

---

#### H-05: `GOOGLE_AI_API_KEY` Not in Zod Env Validation Schema

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/env/env.schema.ts`

The Google AI API key is used directly via `process.env.GOOGLE_AI_API_KEY` in `chat.agent.ts` but is **not included** in the Zod `EnvSchema`. This means:
1. The app will start without this key and fail at runtime when the chat is used
2. No type safety or presence validation

```typescript
// env.schema.ts - Missing GOOGLE_AI_API_KEY
export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_URL: z.string().url(),
  APP_URL: z.string().url(),
  PORT: z.string().min(1).default('8080'),
  ENVIRONMENT: z.enum(['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION']).default('LOCAL'),
  SHOPIFY_STORE_DOMAIN: z.string().min(1),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
  SHOPIFY_API_VERSION: z.string().default('2024-01'),
  GENERAL_ENCRYPTION_SECRET: z.string().min(1),
  // No GOOGLE_AI_API_KEY, ALLOWED_ORIGINS, REDIS_URL, RESEND_API_KEY, EMAIL_PROVIDER
});
```

Similarly missing: `ALLOWED_ORIGINS`, `REDIS_URL`, `RESEND_API_KEY`, `EMAIL_PROVIDER`, `EMAIL_FROM`.

**Impact:** Runtime failures in production if environment variables are misconfigured. Multiple `process.env` accesses bypass the validated ConfigService.

---

### MEDIUM Severity

#### M-01: ValidationPipe Missing `whitelist` and `forbidNonWhitelisted`

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({ transform: true }));
// Missing: whitelist: true, forbidNonWhitelisted: true
```

The project's own `CLAUDE.md` explicitly prescribes these settings:
```
whitelist: true, // Remove propriedades nao decoradas
forbidNonWhitelisted: true, // Retorna erro se houver props extras
```

Without `whitelist: true`, extra properties in request bodies pass through to handlers. Without `forbidNonWhitelisted: true`, clients can send arbitrary properties without error. This creates a mass assignment risk.

**Impact:** Potential mass assignment vulnerability. An attacker could send extra fields in a request body that get passed through to Prisma operations, especially in the Products CRUD where `...createProductDto` spread is used.

---

#### M-02: Swagger/OpenAPI Docs Exposed in All Environments

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts`

Swagger UI is available at `/api-docs` with no environment check:

```typescript
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

There is no conditional like `if (process.env.ENVIRONMENT !== 'PRODUCTION')` to disable it in production. Swagger reveals all endpoints, DTOs, and expected payloads.

**Impact:** Exposes full API surface to attackers in production, aiding reconnaissance.

---

#### M-03: Direct `process.env` Access Bypasses ConfigService

**Files:**
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/encrypt.util.ts` (line 5)
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/utils/decrypt.util.ts` (line 5)
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.agent.ts` (line 67)
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/main.ts` (lines 16-17, 52)
- `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/providers/email/email.module.ts` (lines 11-23)

Six files access `process.env` directly instead of using NestJS `ConfigService`. This bypasses Zod validation and creates fragmentation between validated and unvalidated environment variables.

**Impact:** Runtime failures if variables are misconfigured. No centralized secret management.

---

#### M-04: AI Chatbot Lacks Prompt Injection Defenses

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.agent.ts`

The system prompt includes `{context}` and `{products}` substitutions from knowledge base files and Shopify data. User messages are passed directly as `HumanMessage` with only basic sanitization (HTML tag removal, length limit). There is no:
- Prompt injection detection (e.g., detecting "ignore previous instructions")
- Output filtering for system prompt leakage
- Separation between trusted (system) and untrusted (user) content boundaries

```typescript
// User input goes directly into conversation
const messages = [
    new SystemMessage(systemPrompt),       // Contains {context} and {products}
    ...chatHistory.slice(-6).map(...),     // Previous messages (also user-controlled)
    new HumanMessage(question),            // Direct user input
];
```

The `category` parameter is also user-controlled and injected into the system prompt without sanitization:

```typescript
if (category) {
    categoryInstruction = `
    # CATEGORY FILTER (IMPORTANT)
    The user clicked on the "${category}" category card.
    ...
    `;
}
```

**Impact:** An attacker could craft inputs to extract system prompt content, knowledge base data, or manipulate the chatbot's behavior. The `category` field is an injection vector into the system prompt itself.

---

#### M-05: Product `delete` Is Hard Delete Despite Prisma Schema Having Soft Delete on User

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/products/services/products.service.ts`

Products are permanently deleted (`prisma.product.delete`) while Users have `deletedAt` for soft delete. The Product model has no `deletedAt` field.

```typescript
async delete(productId: string): Promise<void> {
    await this.prisma.product.delete({
        where: { id: productId },
    });
}
```

**Impact:** Combined with C-01 (unprotected delete endpoint), this means any anonymous user can permanently destroy product data with no recovery.

---

#### M-06: UserSession Model Defined but Never Used

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/prisma/schema.prisma`

The `UserSession` model with `token`, `valid`, and `userId` fields is defined in the schema but never referenced in any source file. There are zero imports or uses of `UserSession` across the codebase.

```prisma
model UserSession {
  id        String   @id @default(uuid())
  token     String   @unique
  valid     Boolean  @default(true)
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("userSession")
}
```

**Impact:** Suggests incomplete session management implementation. The current system relies solely on bcrypt-comparing raw tokens, with no session invalidation, revocation list, or session tracking.

---

### LOW Severity

#### L-01: Rate Limiting May Be Insufficient for E-Commerce + AI

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/app.module.ts`

ThrottlerGuard is configured at 30 requests per 30 seconds globally. For the AI chat endpoint (which incurs Google AI API costs), this is arguably too permissive. For the product listing endpoints, it may be adequate. There is no per-endpoint rate limiting differentiation.

```typescript
ThrottlerModule.forRoot({
    throttlers: [{
        ttl: 30000,
        limit: 30,
    }],
}),
```

**Impact:** A single IP can make 60 AI requests per minute, incurring costs.

---

#### L-02: `GENERAL_ENCRYPTION_SECRET` Minimum Length Is 1 Character

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/env/env.schema.ts`

```typescript
GENERAL_ENCRYPTION_SECRET: z.string().min(1),
```

A single-character encryption key provides negligible cryptographic strength. Should enforce minimum 32 characters for AES-256.

---

#### L-03: Chat History Size Not Limited at DTO Level

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/dto/chat.dto.ts`

The `history` array has no `@ArrayMaxSize` decorator. While `chat.agent.ts` slices to the last 6 messages, an attacker could send a large history array (thousands of entries) that must be validated and processed before slicing.

---

#### L-04: Shopify API Version Hardcoded

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/shopify/shopify-client.service.ts`

The API URL uses hardcoded version `2024-01`:

```typescript
this.apiUrl = `https://${domain}/api/2024-01/graphql.json`;
```

While `SHOPIFY_API_VERSION` is in the env schema with a default of `2024-01`, the `ShopifyClientService` does not use it -- it hardcodes the same value.

---

#### L-05: Dockerfile Exposes Source Code in Production Image

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/Dockerfile`

```dockerfile
# Copiar codigo fonte para auditoria
COPY --from=builder /app/src ./src
```

The production Docker image includes full source code "for auditing." This increases attack surface if the container is compromised.

---

## Ecosystem Comparison Table

| Vulnerability Pattern | Scafold | Vaultly | Veris | Chats | Chorus | **Zenberry** |
|---|---|---|---|---|---|---|
| Admin bypass token `001239...` | YES | No | YES | YES | No | **No** |
| ApiKeyGuard disabled (`return true`) | YES | No | No | No | YES | **No** |
| BullBoard hardcoded password | YES | No | No | No | YES | **No** |
| JWT fallback secret hardcoded | YES | YES | No | No | No | **N/A** (no JWT) |
| JWT in localStorage | YES | YES | YES | YES | YES | **N/A** (Shopify token, BE only) |
| Zero Helmet/security headers | YES | Partial | YES | YES | YES | **YES** |
| CORS wildcard/misconfigured | YES | No | YES | YES | YES | **Partial** (dual init) |
| CryptoJS AES weak mode | YES | No | No | No | YES | **YES** (unused but present) |
| Unprotected admin endpoints | No | No | No | No | No | **YES** (Products CRUD) |
| process.env bypassing ConfigService | YES | Yes | YES | YES | YES | **YES** (6 files) |

### Positive Differentiators
- **No admin bypass token** -- The hardcoded token `001239421348580124802138023832102310` found in Scafold, Veris, and Chats is absent
- **No ApiKeyGuard disabled** -- No `return true` bypass pattern found
- **No BullBoard** -- No BullBoard dependency or hardcoded dashboard password
- **No JWT at all** -- Uses Shopify-issued opaque tokens instead of self-managed JWTs, eliminating JWT secret and algorithm confusion risks
- **bcrypt on token storage** -- Shopify access tokens are bcrypt-hashed before DB storage, which is better than most ecosystem projects
- **Zod env validation** -- Environment schema validated at startup, though incomplete

### Negative Differentiators (Unique to Zenberry)
- **Completely unprotected Products CRUD** -- No other Dooor project has admin/management endpoints without any guard
- **O(N) bcrypt full-table scan** -- Unique architectural flaw not seen in other projects
- **Public AI chatbot endpoint** -- Creates financial risk via API cost abuse
- **category parameter injection into system prompt** -- Unique AI security concern

---

## Architectural Notes

### Smaller Codebase, Smaller Attack Surface

Zenberry's ~4.3K LOC across 52 files is significantly smaller than its Dooor siblings. The reduced surface means:
- Fewer places to hide vulnerabilities
- Simpler authentication model (delegated to Shopify)
- No multi-tenancy complexity (eliminates entire classes of IDOR bugs)
- No RBAC complexity (but also no authorization granularity)
- 3 Prisma models vs 10+ in larger siblings

However, the simplicity also means fewer security layers. With no RBAC, no session management, and no middleware-level auth, the system relies entirely on per-endpoint `@UseGuards` decorators, which are easily forgotten (as demonstrated by C-01 and C-02).

### Shopify OAuth as Authentication

The decision to delegate authentication to Shopify Storefront API is architecturally sound for an e-commerce platform:
- Passwords never touch the Zenberry backend
- Token issuance, rotation, and expiration managed by Shopify
- Customer identity verified by a trusted third party

The weakness is in how Zenberry looks up users by their token -- the O(N) bcrypt scan. A simple indexed encrypted-token column would eliminate this.

---

## Prioritized Recommendations

### P0 -- Immediate (Production Blockers)

1. **Add `@UseGuards(ShopifyJwtGuard)` to ProductsController** -- At minimum on POST, PATCH, and DELETE methods. Consider class-level guard. File: `products.controller.ts`

2. **Add `@UseGuards(ShopifyJwtGuard)` to UsersController** -- The GET endpoint expects `req.user` but has no guard. File: `users.controller.ts`

3. **Replace O(N) bcrypt scan with indexed token lookup** -- Store an encrypted (not hashed) version of the token, or store a token hash with a fast algorithm (SHA-256) alongside the bcrypt hash, and use the fast hash for lookup. File: `shopify-auth.service.ts`

### P1 -- High Priority (Next Sprint)

4. **Add Helmet middleware** -- `npm install helmet` and `app.use(helmet())` in `main.ts`

5. **Remove `{ cors: true }` from NestFactory.create** -- The later `enableCors()` call is sufficient. Eliminate dual initialization.

6. **Add `whitelist: true` and `forbidNonWhitelisted: true`** to `ValidationPipe` configuration in `main.ts`

7. **Add authentication to chat endpoints** -- Or at minimum, implement stricter per-endpoint rate limiting (e.g., 5 req/min for `/chat/ask`)

8. **Add `GOOGLE_AI_API_KEY` and `ALLOWED_ORIGINS`** to the Zod `EnvSchema`

### P2 -- Medium Priority (Planned Work)

9. **Replace CryptoJS with Node.js native `crypto`** -- Use AES-256-GCM with proper IV and authenticated encryption. If encryption utils are unused, remove them entirely.

10. **Implement the UserSession model** -- The schema is defined but unused. Wire it up for session tracking and invalidation.

11. **Sanitize `category` parameter** before injecting into system prompt -- Validate against a whitelist of known categories.

12. **Add `@ArrayMaxSize(10)` to `history` field** in `AskQuestionDto`

13. **Conditionally disable Swagger** in production environment

14. **Replace all `process.env` direct access** with `ConfigService` injection

### P3 -- Low Priority (Hardening)

15. **Enforce minimum 32-character `GENERAL_ENCRYPTION_SECRET`** in env schema

16. **Use `SHOPIFY_API_VERSION` from ConfigService** in `ShopifyClientService` instead of hardcoding

17. **Remove source code from production Docker image** -- Remove the `COPY --from=builder /app/src ./src` line

18. **Add soft delete to Product model** -- Consistent with User model pattern

19. **Add per-endpoint rate limiting** -- Stricter limits on auth endpoints and AI endpoints vs read-only product listing

---

*Report generated by Agent 1 -- Backend Security Analysis*
*Zenberry Platform Audit -- Dooor Ecosystem*
