# Agent 10 -- Architecture & Cross-Cutting Concerns Analysis

**Project:** Zenberry (CBD/THC e-commerce + AI chatbot)
**Date:** 2026-02-04
**Agent:** 10 of 10 (Architecture & Cross-Cutting Concerns)
**Repos audited:** `zenberry-api` (NestJS) + `zenberry-front` (Next.js 16)

---

## Executive Summary

Zenberry is a domain-focused e-commerce MVP built on the Dooor/Scafold template, heavily stripped down to serve a single purpose: selling CBD/THC products with an AI-powered chatbot assistant. It makes a deliberate architectural bet on **Shopify as the source of truth** for both products and customer identity, using the Storefront GraphQL API extensively. The backend acts primarily as a **proxy/orchestrator** layer for Shopify auth and AI chat, while the frontend talks directly to Shopify for product catalog browsing. This creates a split-brain architecture where products exist in two completely unconnected systems (Shopify Storefront API + Prisma `Product` table) with zero synchronization.

**Overall Architecture Score: 5.8/10** (below ecosystem average of 6.5)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Frontend-Backend Consistency | 4.5/10 | Dual product source, type misalignment, stale User type |
| Port & Adapter Quality | 3.0/10 | 2 ports exist, 0 are used; 14 tokens, 0 injected |
| Shopify Integration | 7.0/10 | Well-executed GraphQL, good auth flow, checkout works |
| AI/LLM Architecture | 6.5/10 | Decent LangChain setup, in-memory RAG, tools defined but unused |
| Chat Architecture | 6.0/10 | Dual hooks, SSE proxy, rate limiting present |
| Product Catalog | 3.5/10 | Completely split between Shopify and Prisma with no sync |
| Auth Architecture | 5.5/10 | Functional but with O(n) token lookup vulnerability |
| Cart Architecture | 6.5/10 | Clean localStorage + Shopify checkout integration |
| Compliance Architecture | 7.0/10 | Strong system prompt guardrails |
| RBAC Gap | 2.0/10 | Zero role-based access; CRUD endpoints publicly exposed |
| Production Readiness | 4.5/10 | Solid MVP, significant gaps for production |

---

## 1. Frontend-Backend Consistency

### 1.1 Types Alignment

**Critical misalignment: the frontend Product type has zero relationship to the backend Product type.**

Backend `Product` (Prisma model at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/prisma/schema.prisma`):
```
model Product {
  id, name, image, description, price, size, flavor,
  categories[], effects[], benefits, ingredients
}
```

Frontend `Product` (at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/types/product.ts`):
```typescript
interface Product {
  id, variantId, handle, name, description, price,
  originalPrice, discount, images[], rating, reviewCount,
  inStock, featured, ingredients[], howToUse,
  cbdType, productCategory, format, cbdAmount,
  concentration, carrier, productUse, thcAmount, quantity, tags[]
}
```

These are completely different schemas. The frontend Product comes from **Shopify** via `mapShopifyProductToProduct()` (at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/mappers/product-mapper.ts`), while the backend Product model sits in Postgres and is served via a separate REST API. No code connects the two.

### 1.2 Auth Types -- Good Alignment

Frontend `AuthResponse` at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/types/auth.ts`:
```typescript
interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  customer: CustomerData;
}
```

Backend `ShopifyAuthResponseDto` at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/auth/shopify/dto/shopify-auth-response.dto.ts`:
```typescript
class ShopifyAuthResponseDto {
  accessToken: string;
  expiresAt: string;
  customer: { id, email, firstName, lastName, phone, acceptsMarketing };
}
```

These align well. The one difference: frontend `CustomerData` omits `id` (the Shopify GID) while backend includes it. Minor inconsistency.

### 1.3 Chat Types -- Reasonable Alignment

Frontend `AskResponse` has a `question` field that the backend `ChatResponseDto` does not return. Frontend expects `{ question, answer, timestamp }`, backend returns `{ answer, timestamp }`. This is a subtle bug -- the `question` field in `AskResponse` will always be `undefined`.

### 1.4 Stale Legacy Type

`/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/types/user.ts` still references a `google_id` field from a previous auth system:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  google_id: string;  // Dead field -- Shopify is the auth system now
}
```

### 1.5 Endpoint Contracts

The frontend calls these backend endpoints:
| Frontend Service | Backend Endpoint | Contract Status |
|-----------------|-----------------|-----------------|
| `authService.loginWithShopify` | `POST /v1/auth/shopify/login` | Aligned |
| `authService.registerWithShopify` | `POST /v1/auth/shopify/register` | Aligned |
| `authService.getCurrentCustomer` | `GET /v1/auth/shopify/customer` | Aligned |
| `authService.logoutShopify` | `POST /v1/auth/shopify/logout` | Aligned |
| `authService.updateProfile` | `PUT /v1/users/settings` | Aligned |
| `chatService.ask` | `POST /v1/chat/ask` | Minor mismatch (question field) |
| `chat/stream route.ts` | `POST /v1/chat/stream` | Aligned |
| `product-service.ts` | `GET /v1/products` | **Unused in practice** -- frontend gets products from Shopify directly |

The product-service on the frontend calls the backend's Prisma product endpoint, but the products page actually fetches from Shopify. This is confusion -- there are two product pipelines active.

---

## 2. Port & Adapter Implementation

### 2.1 Defined Ports

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/providers/cache/cache.port.ts`
```typescript
export interface CachePort {
    get<T>(key: string): Promise<T | null>;
    mget<T>(keys: string[]): Promise<(T | null)[]>;
    set<T>(key: string, val: T, ttlSec?: number): Promise<void>;
    del(keys: string | string[]): Promise<void>;
}
```

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/providers/email/email.port.ts`
```typescript
export interface EmailPort {
    send(input: SendEmailInput): Promise<SendEmailResult>;
}
```

### 2.2 Implemented Adapters

| Port | Adapter | Quality |
|------|---------|---------|
| CachePort | `RedisCacheAdapter` | **8/10** -- Complete implementation with health checks, TTL, error handling, auto-pipelining |
| EmailPort | `ResendEmailAdapter` | **7/10** -- Retry logic with exponential backoff (4 attempts), idempotency keys |

### 2.3 Usage Status: ZERO

**Neither CacheModule nor EmailModule is imported in `AppModule`.** They exist as code but are completely dead. Not a single module in the application injects `TOKENS.CACHE` or `TOKENS.EMAIL`.

Grep confirms: `CacheModule` and `EmailModule` appear only in their own definition files. They are never imported by any application module.

### 2.4 Port Count vs Ecosystem

| Project | Ports | Active | Ratio |
|---------|-------|--------|-------|
| Vaultly | 30+ | 30+ | ~100% |
| Scafold | 5 | 5 | 100% |
| Zenberry | 2 | **0** | **0%** |

---

## 3. TOKENS Injection System

### 3.1 All Defined Tokens

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/common/injection-tokens.ts`

```typescript
export const TOKENS = {
    EMAIL: Symbol('EmailPort'),           // Unused
    CACHE: Symbol('CachePort'),           // Unused
    BUCKET: Symbol('BucketPort'),         // No implementation exists
    AI_ANTHROPIC: Symbol('AnthropicAIPort'),    // No implementation
    AI_GEMINI: Symbol('GeminiAIPort'),          // No implementation (Gemini used directly via LangChain)
    AI_GPT_OSS: Symbol('GPTOSSAIPort'),         // No implementation
    AI_QWEN: Symbol('QwenAIPort'),              // No implementation
    AI_OPENAI: Symbol('OpenAIPort'),            // No implementation
    AI_PERPLEXITY: Symbol('PerplexityAIPort'),  // No implementation
    AI_MANAGER: Symbol('AIManagerService'),      // No implementation
    TRANSCRIPTION_ASSEMBLY_AI: Symbol('...'),    // No implementation
    TRANSCRIPTION_WHISPER_LOCAL: Symbol('...'),  // No implementation
    TRANSCRIPTION_MANAGER: Symbol('...'),        // No implementation
} as const;
```

**14 tokens defined. 0 tokens actually injected anywhere.**

The `TOKENS.EMAIL` and `TOKENS.CACHE` are referenced only in their respective module files which are never imported. The remaining 12 tokens (AI providers, bucket, transcription) are pure Scafold template leftovers with zero implementations.

---

## 4. Shopify Integration Architecture

### 4.1 Auth Flow (Complete)

```
Register:
  Frontend (RegisterData) -> POST /v1/auth/shopify/register
    -> Shopify customerCreate mutation
    -> Shopify customerAccessTokenCreate mutation
    -> bcrypt hash token -> save to Prisma User
    -> return { accessToken, expiresAt, customer }
  Frontend saves token in httpOnly cookie (Server Action)

Login:
  Frontend (LoginCredentials) -> POST /v1/auth/shopify/login
    -> Shopify customerAccessTokenCreate mutation
    -> Shopify customer query (to get full data)
    -> bcrypt hash token -> upsert Prisma User
    -> return { accessToken, expiresAt, customer }

Get Current Customer:
  Frontend -> GET /v1/auth/shopify/customer (Bearer token)
    -> Iterate ALL users in DB, bcrypt.compare each token (O(n) scan!)
    -> Check token expiry
    -> Query Shopify for fresh customer data
    -> return combined local + Shopify data

Logout:
  Frontend -> POST /v1/auth/shopify/logout (Bearer token)
    -> Same O(n) scan to find user
    -> Shopify customerAccessTokenDelete mutation
    -> Clear token from Prisma User
    -> Frontend clears httpOnly cookie
```

### 4.2 Critical Auth Vulnerability: O(n) Token Lookup

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/auth/shopify/shopify-auth.service.ts`, lines 217-229

```typescript
async getCurrentCustomer(token: string) {
    const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
    });
    let user = null;
    for (const u of users) {
        if (u.shopifyAccessToken && await bcrypt.compare(token, u.shopifyAccessToken)) {
            user = u;
            break;
        }
    }
}
```

This loads **every user from the database** and performs a bcrypt comparison on each one. bcrypt is intentionally slow (~100ms per comparison). With 1000 users, worst case is 100 seconds per auth check. This is called on every guarded endpoint AND on every page load (via `refreshCustomer`).

**Severity:** Critical for any non-trivial user count. The `ShopifyJwtGuard` calls `getCurrentCustomer` which triggers this scan, meaning every authenticated request has O(n) latency.

### 4.3 Product Sync: There Is None

**Shopify is the source of truth for the frontend product catalog.** The frontend queries Shopify's Storefront GraphQL API directly (via Next.js server-side `shopifyQuery` function) for:
- Product listing (`GET_PRODUCTS_QUERY`)
- Product detail (`GET_PRODUCT_BY_HANDLE_QUERY`)
- Product search (`SEARCH_PRODUCTS_QUERY`)
- Collection browsing (`GET_COLLECTION_BY_HANDLE_QUERY`)

**The backend Prisma `Product` model is a completely independent, disconnected data store.** The backend's `ProductsController` exposes full CRUD on the Prisma table, but:
1. No Shopify product data ever flows into it
2. The frontend's product pages do not call the backend product endpoint
3. There is a `product-service.ts` in the frontend that calls the backend, but it appears to be a leftover/secondary system

The chatbot's `ChatProductsService` fetches products from Shopify (via the backend's `ShopifyClientService`), cached in-memory for 5 minutes.

### 4.4 GraphQL API Usage Patterns

**Backend Shopify queries (via `ShopifyClientService`):**
- `customerCreate` mutation
- `customerAccessTokenCreate` mutation
- `customerAccessTokenDelete` mutation
- `customer` query (by access token)
- `customerUpdate` mutation (profile updates)
- `products` query (for chatbot, first: 50)

**Frontend Shopify queries (via `shopifyQuery`):**
- `getProducts` query (with metafields, variants, images)
- `getProductByHandle` query (with ingredients metaobject references)
- `searchProducts` query
- `getCollectionByHandle` query
- `cartCreate` mutation (checkout flow)
- `cartLinesAdd` mutation

**Error handling:**
- Backend: Checks `result.errors[0].message`, throws `HttpException(400)`. Basic but functional.
- Frontend: Checks `response.ok`, then `result.errors`, throws descriptive errors. Slightly better.
- Neither handles rate limiting gracefully (backend has a single rate-limit check for registration only).

### 4.5 API Version Mismatch

Backend uses Shopify API version `2024-01`.
Frontend uses Shopify API version `2023-10`.

These are different versions which could cause subtle incompatibilities in available fields or behaviors.

---

## 5. AI/LLM Architecture

### 5.1 LangChain Agent Setup

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.agent.ts`

Model: `ChatGoogleGenerativeAI` with `gemini-2.5-flash`
- Temperature: 0.7 (reasonable for conversational responses)
- Max output tokens: 2048
- API key from env: `GOOGLE_AI_API_KEY` (not validated in EnvSchema!)

The model is initialized in the constructor. The `ChatTools` class is instantiated but **never bound to the model**. The agent uses direct `model.invoke()` and `model.stream()` calls, not LangChain's agent executor with tool binding.

### 5.2 Tools: Defined But Not Used

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.tools.ts`

Four tools are defined:
1. `search_products` -- searches Shopify products by keyword
2. `get_site_info` -- retrieves specific sections from the knowledge base
3. `get_full_context` -- returns all context (with 10K char limit)
4. `calculate_dosage` -- calculates CBD dosage based on weight

However, `getAllTools()` is never called. In `chat.agent.ts`, the model is invoked directly without tool binding:
```typescript
const result = await this.model.invoke(messages);
```

Instead of using tools for dynamic retrieval, the agent pre-loads **all** context and **all** products into the system prompt on every request. This is a "stuff everything in the prompt" approach, not a true tool-calling agent.

### 5.3 RAG Pipeline

**Architecture:** File-based in-memory RAG

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/context/context.service.ts`

1. On module init, loads 6 markdown files from `src/modules/context/data/`:
   - `01_basic_science_cannabinoids.md`
   - `02_extraction_spectrums.md`
   - `03_benefits_wellness_guide.md`
   - `04_dosage_consumption_guide.md`
   - `05_safety_legality_compliance.md`
   - `06_about_zenberry_faq.md`
2. Concatenates all files into a single string (`contextCache`)
3. Provides `getContext()` (full dump), `getInfoSection()` (header-based search), `searchProducts()` (keyword matching)

**Comparison with ecosystem:**
| Feature | Zenberry | Chorus | Vaultly |
|---------|----------|--------|---------|
| Storage | In-memory string | pgvector | pgvector |
| Embedding model | None | OpenAI/etc | OpenAI/etc |
| Retrieval | Full dump into prompt | Semantic search | Multi-query RAG |
| Scalability | ~10-50K chars max | Millions of chunks | Millions of chunks |
| Relevance | Low (everything sent) | High (vector similarity) | Very high |

Zenberry's approach is the simplest possible: stuff the entire knowledge base (~5K chars truncated) and all products (~10K chars truncated) into every system prompt. This works for a small knowledge base but doesn't scale.

### 5.4 Context Injection

Per request, the system prompt is assembled:
```
System prompt template (rules, company info placeholder, product placeholder)
  + context (truncated to 5000 chars)
  + products (truncated to 10000 chars)
  + optional category instruction
  + last 6 history messages
  + current question
```

Estimated token usage per request: ~4000-6000 tokens for the system prompt alone. With Gemini 2.5 Flash this is manageable but wasteful.

---

## 6. Chat Architecture

### 6.1 Request Flow

```
Frontend (useChat hook)
  -> POST /v1/chat/ask (via apiAxios)
     -> ChatController.ask()
        -> ChatService.ask()
           -> sanitizeInput() + validateInput()
           -> ChatAgent.runAgent()
              -> ContextService.getContext()
              -> ChatProductsService.getAllProducts() (Shopify query, 5min cache)
              -> Build system prompt with all context + all products
              -> model.invoke(messages)
           -> isLowQuality() check
        -> return { answer, timestamp }
```

### 6.2 Streaming (SSE) Architecture

```
Frontend (useChatStream hook)
  -> EventSource GET /api/chat/stream?question=...&history=...
     -> Next.js API Route (proxy)
        -> POST /v1/chat/stream (to backend)
           -> ChatController.streamChat() @Sse()
              -> ChatService.askStream()
                 -> ChatAgent.streamAgent()
                    -> model.stream(messages)
                    -> yield chunks
           -> Observable<MessageEvent> via RxJS from()
        -> ReadableStream back to EventSource
```

**Key issue:** The SSE proxy uses GET with query parameters, which means the chat history is passed as a URL-encoded JSON string in the URL. Long conversations will hit URL length limits (typically 2048-8192 chars).

### 6.3 Dual Hook Architecture

The frontend provides two independent hooks:

1. **`useChat`** (`/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/hooks/use-chat.ts`):
   - Non-streaming, POST-based
   - Rate limiting: 10 messages/minute + 2-second cooldown between messages
   - localStorage persistence under `zenberry_chat_history`
   - Full message add/remove on success/failure

2. **`useChatStream`** (`/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/hooks/use-chat-stream.ts`):
   - Streaming via EventSource
   - Reconnection logic (3 attempts, 2s delay)
   - localStorage persistence under `zenberry_chat_stream_history`
   - Cancel stream capability
   - No rate limiting (unlike useChat)

These hooks have **separate localStorage keys**, meaning chat history is not shared between streaming and non-streaming modes.

### 6.4 Rate Limiting (Dual)

**Backend:** `ThrottlerModule` -- global guard, 30 requests per 30 seconds.
**Frontend:** `useChat` hook -- 10 messages per minute + 2-second cooldown.

The `useChatStream` hook has NO rate limiting, creating an asymmetry. The backend throttler will still catch abuse, but the frontend doesn't warn the user before hitting the server-side limit.

---

## 7. Product Catalog Architecture

### 7.1 Dual Source Problem

There are **two completely independent product systems**:

**System A: Shopify Storefront API (Primary)**
- Used by: Frontend product pages, frontend search, chatbot `ChatProductsService`
- Data: Rich product data with metafields, variants, images, ingredients references, collections
- Type: `ShopifyProduct` -> mapped to frontend `Product` via `mapShopifyProductToProduct()`
- Access: Direct GraphQL queries from Next.js server components and API routes

**System B: Prisma Product Table (Orphan)**
- Used by: Backend `ProductsController` CRUD endpoints
- Data: Simpler schema (name, price, description, size, flavor, categories, effects, benefits, ingredients)
- Type: `Product` (Prisma) -> `ProductResponseDto`
- Access: REST API at `/v1/products`
- State: **No data appears to flow into this table.** It likely has zero rows unless manually populated.

The frontend does have a `product-service.ts` that calls the backend `/v1/products` endpoint, but the actual products pages (`/products`, `/products/[handle]`) use Shopify directly.

### 7.2 Search Implementation

Frontend search (`/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/api/products/search/route.ts`):
- Calls Shopify's `products(query: $query)` GraphQL field
- Up to 250 products per query
- Client-side filtering in `use-search-products.ts` with 5-minute cache

Chatbot search (`ChatProductsService.searchProducts()`):
- Fetches all products from Shopify (up to 50)
- Client-side keyword matching on title, description, tags
- 5-minute in-memory cache

Backend search: Only basic pagination (take/skip), no search by name or category.

### 7.3 Filtering

Frontend filtering is done entirely client-side based on Shopify metafields:
- CBD Type (Full Spectrum, Broad Spectrum, Isolate, etc.)
- Category (Sleep Support, Daily Balance, Pain & Recovery, etc.)
- Format (Tincture, Gummies, Softgels, Cream, etc.)
- User (Myself/Loved Ones, Pets)

These filter types are defined in `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/types/product.ts` and `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/types/product-filters.ts`.

---

## 8. Auth Architecture

### 8.1 Unique Shopify OAuth Pattern

Zenberry is the only Dooor project using Shopify as the identity provider:

```
Ecosystem Auth Comparison:
  Scafold:  Magic Links + JWT + RBAC + 2FA
  Vaultly:  Magic Links + JWT + RBAC
  Chorus:   Magic Links + JWT
  Chats:    Magic Links + JWT
  Zenberry: Shopify Customer Access Tokens (no JWT, no magic links)
```

The Shopify customer access token IS the session token. There is no JWT wrapping. The raw Shopify token is:
1. Sent from Shopify to the backend on login/register
2. bcrypt-hashed and stored in Prisma `User.shopifyAccessToken`
3. Stored in browser httpOnly cookie (`shopify_customer_token`)
4. Sent as `Bearer` token on authenticated requests
5. Validated by loading all users and bcrypt-comparing

### 8.2 Token Management

**Storage layers:**
- **httpOnly cookie** (server-side, managed by Next.js Server Actions at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/server/auth-service.ts`)
- **localStorage** `auth_token` key (client-side, used by axios interceptor at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/config/axios.ts`)
- **React state** in AuthContext (runtime)

There is a inconsistency: the axios config reads from `localStorage.auth_token`, but the auth flow saves to httpOnly cookie only. The localStorage path is a dead code from the old auth system. The actual API calls in `auth-service.ts` (client) pass the token explicitly via headers, bypassing the axios interceptor.

### 8.3 UserSession Model

The Prisma schema defines a `UserSession` model with a `token` and `valid` boolean, but this model is **never used in any service or controller**. It appears to be a Scafold template remnant that was never implemented for Zenberry's Shopify-based auth.

### 8.4 Token Rotation

The settings update endpoint (`/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/users/services/settings.service.ts`) correctly handles Shopify token rotation: when Shopify returns a new token after a `customerUpdate` mutation, the backend re-hashes it and the frontend saves the new token in the cookie.

---

## 9. Cart Architecture

### 9.1 Frontend-Only State, Shopify Checkout

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/contexts/cart-context.tsx`

Cart management is **100% client-side**:
- State: React Context + localStorage (`zenberry-cart`)
- Cross-tab sync: `storage` event listener
- Items: `{ id, variantId, name, price, quantity, image, variant, inStock }`
- No server-side persistence

### 9.2 Checkout Flow

When the user clicks "Buy Now" or proceeds to checkout:

```
Frontend: useProtectedAction() check (must be authenticated)
  -> createCheckoutFromCart() Server Action
     -> getAuthToken() from cookie
     -> Shopify cartCreate mutation (with buyerIdentity.customerAccessToken)
     -> redirect(cartCreate.cart.checkoutUrl)
```

This redirects to Shopify's hosted checkout, which handles payment processing, shipping, and order management. Zenberry never handles payment data.

### 9.3 Cart Limitations
- Cart is lost if localStorage is cleared
- Cart items reference Shopify variant IDs but price is snapshotted at add-time (could go stale)
- No inventory validation before checkout (Shopify handles this at checkout)
- No cart-to-user association (cart is device-specific, not account-specific)
- The `ADD_TO_CART_MUTATION` is defined but not used -- Zenberry creates a new cart on each checkout rather than maintaining a persistent Shopify cart

---

## 10. CBD/THC Compliance Architecture

### 10.1 System Prompt Guardrails

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/chat/chat.agent.ts`, line 27

The system prompt includes strong compliance rules:
```
# CRITICAL RULES
- NEVER make medical diagnoses or prescribe treatments
- NEVER claim that CBD treats, cures, or prevents diseases
- ALWAYS recommend consulting a qualified healthcare professional
- Use ONLY information from the provided context
```

### 10.2 Input Validation

**Backend (`ChatService`):**
- HTML tag removal: `replace(/[<>]/g, '')`
- Length limits: 2-2000 characters
- Spam detection: repeated characters (10+), URL blocking
- Low-quality response detection with fallback

**Frontend (`chat-api.ts`):**
- HTML tag removal: `replace(/<[^>]*>/g, '')`
- Length limit: 2000 characters

### 10.3 Compliance Gaps

1. **No prompt injection protection.** The system prompt rules can potentially be overridden by clever user input. There is no system-level prompt hardening or output filtering.
2. **No content moderation on AI output.** The `isLowQuality()` check looks for very short or generic responses, not for medical claims or compliance violations.
3. **Dosage calculator tool** (`chat.tools.ts`) provides specific mg-per-kg dosage recommendations. Even though it includes disclaimers, this could be seen as medical advice in regulatory contexts. However, since the tools are not actually called (see section 5.2), this is currently a dead code risk.
4. **Knowledge base compliance** depends entirely on the content of the 6 markdown files. If those files contain non-compliant claims, the AI will repeat them.

---

## 11. Ecosystem Comparison: Scafold DNA Analysis

### 11.1 What Was Kept from Scafold

| Feature | Scafold | Zenberry | Status |
|---------|---------|----------|--------|
| NestJS + Prisma + PostgreSQL | Yes | Yes | Kept |
| Module structure | Domain modules | Domain modules | Kept |
| ConfigModule + Zod EnvSchema | Yes | Yes | Kept |
| ThrottlerModule (rate limiting) | Yes | Yes | Kept |
| ClsModule (request context) | Yes | Yes | Kept |
| Swagger/OpenAPI | Yes | Yes | Kept |
| URI versioning (v1) | Yes | Yes | Kept |
| ValidationPipe global | Yes | Yes | Kept |
| PrismaModule (global) | Yes | Yes | Kept |
| injection-tokens.ts | Yes | Yes (14 tokens) | Kept but unused |
| CachePort + Redis adapter | Yes | Yes (full code) | Kept but unused |
| EmailPort + Resend adapter | Yes | Yes (full code) | Kept but unused |
| encrypt/decrypt utils | Yes | Yes | Kept |
| custom-validators.ts | Yes | Yes | Kept |
| timezone.util.ts | Yes | Yes | Kept |
| lexical.util.ts | Yes | Yes | Kept (likely unused) |
| request-context.middleware | Yes | Yes | Kept |
| ScheduleModule | Yes | Yes (imported) | Kept but no scheduled tasks |
| MulterModule | Yes | Yes (imported) | Kept but no file upload endpoints |
| WebSocket adapter (IoAdapter) | Yes | Yes (imported) | Kept but no WebSocket usage |

### 11.2 What Was Removed

| Scafold Feature | Status |
|----------------|--------|
| Multi-tenancy (Workspace/Organization) | Removed |
| RBAC (Role, Permission, UserRole) | Removed |
| Magic Link auth | Replaced with Shopify auth |
| 2FA | Removed |
| Bucket/Storage port | Token exists, no implementation |
| AI provider ports (Anthropic, OpenAI, etc.) | Tokens exist, LangChain used directly |
| Transcription ports | Tokens exist, no implementation |
| Email sending flows | Port exists, never imported |
| i18n | Not present |

### 11.3 What Was Added (Zenberry-Specific)

| Feature | Notes |
|---------|-------|
| ShopifyModule + ShopifyClientService | Storefront API GraphQL client |
| ShopifyAuthModule | Full register/login/logout/customer flow |
| ShopifyJwtGuard | Token validation via Shopify |
| ChatModule + ChatAgent + ChatTools | LangChain + Gemini AI chatbot |
| ContextModule + ContextService | In-memory RAG with 6 markdown files |
| ChatProductsService | Shopify product fetching for chatbot |
| Frontend: Shopify GraphQL queries | 6 typed queries/mutations |
| Frontend: Product mapper | Shopify -> internal Product type |
| Frontend: Cart context + checkout | localStorage + Shopify checkout |
| Frontend: Chatbot context + hooks | useChat + useChatStream |
| Frontend: Route guards | ProtectedPage, GuestOnlyPage, RouteGuard |

### 11.4 Is Zenberry a "Lite" Version?

Yes. Zenberry is essentially **Scafold minus auth/RBAC/multi-tenancy, plus Shopify and AI chat**. About 60% of the infrastructure code is inherited Scafold DNA that is either directly used (Prisma, Config, Throttler) or carried as dead weight (Cache, Email, injection tokens, utilities).

---

## 12. RBAC Gap Analysis

### 12.1 Current State: No RBAC

Zenberry has exactly **one role**: authenticated customer. There is no admin role, no role table, no permission checking beyond "is this person logged in?"

### 12.2 Unprotected Endpoints

The Products controller at `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-api/src/modules/products/controllers/products.controller.ts` exposes:

| Method | Endpoint | Guard | Risk |
|--------|----------|-------|------|
| GET | `/v1/products` | None | Low (public listing is normal) |
| GET | `/v1/products/:id` | None | Low |
| POST | `/v1/products` | **None** | **HIGH** -- Anyone can create products |
| PATCH | `/v1/products/:id` | **None** | **HIGH** -- Anyone can modify products |
| DELETE | `/v1/products/:id` | **None** | **HIGH** -- Anyone can delete products |

The `POST`, `PATCH`, and `DELETE` product endpoints have no authentication guard. Any HTTP client can create, modify, or delete products in the Prisma database. The Swagger docs mention "ownership validation" but no such check exists in the code -- `findOneById` is called before update/delete but only checks existence, not ownership (and there's no `userId` field on the Product model anyway).

The Chat endpoint (`POST /v1/chat/ask`) also has no auth guard, which is intentional (chatbot should work for anonymous visitors), but there's no distinction in behavior for authenticated vs anonymous users.

The Users controller (`GET /v1/users`) accesses `req.user.id` without a guard, which will crash with a null reference if no auth middleware populates `req.user`.

### 12.3 What an E-commerce RBAC Should Look Like

```
Required Roles:
  - Admin: manage products, view all orders, manage customers, configure chatbot
  - Customer: browse products, chat, add to cart, checkout, view own orders
  - Anonymous: browse products, chat (limited)

Missing Controls:
  - Product CRUD should require Admin role
  - User settings update should require the requesting user to own the profile
  - Chat rate limiting should differ by role (anonymous < customer < admin)
  - Order management endpoints don't exist yet
```

---

## 13. Production-Readiness Assessment

### 13.1 Classification: **Late MVP / Early Alpha**

The project is functional as a demo but has significant gaps for production deployment.

### 13.2 What Works Well

1. **Shopify integration is solid.** Auth flow, product queries, checkout -- all functional with proper error handling.
2. **AI chatbot core works.** System prompt is well-crafted, streaming is implemented, rate limiting exists.
3. **Frontend UX is comprehensive.** Auth guards, cart with cross-tab sync, search modal, product filtering, favorites (localStorage).
4. **httpOnly cookie auth** is a security best practice that many MVPs skip.
5. **Swagger API documentation** is thorough with examples.

### 13.3 What Is Missing for Production

| Gap | Severity | Description |
|-----|----------|-------------|
| **O(n) auth scan** | Critical | bcrypt comparison on all users per request. Will break at ~100 users. |
| **No RBAC** | Critical | Product CRUD is publicly accessible. |
| **Dual product system** | High | Prisma Products and Shopify Products are unconnected. |
| **GOOGLE_AI_API_KEY not in EnvSchema** | High | AI will silently fail if key is missing. |
| **No error monitoring** | High | No Sentry, DataDog, or equivalent. Logger only. |
| **No health check endpoint** | Medium | No `/health` for load balancers or k8s. |
| **Dead infrastructure code** | Medium | CacheModule, EmailModule, 14 unused tokens add confusion. |
| **No automated tests** | Medium | Test directory exists but no test files were found. |
| **Mock data in production code** | Medium | `mock-products.ts`, `mock-orders.ts`, `mock-reviews.ts` in frontend. |
| **Hardcoded API version** | Low | Shopify API versions hardcoded as strings, not from config. |
| **Mixed language** | Low | Error messages mix Portuguese and English. |
| **URL-encoded SSE params** | Low | Chat history in URL will hit length limits with long conversations. |
| **No CORS env in EnvSchema** | Low | ALLOWED_ORIGINS read from env but not validated. |
| **Stale User type** | Low | Frontend `user.ts` has `google_id` from old auth. |

### 13.4 Gap Analysis vs Typical E-commerce Platform

| E-commerce Feature | Zenberry Status |
|-------------------|-----------------|
| Product catalog | Via Shopify (works) |
| Search | Via Shopify (works) |
| Filtering | Client-side (works) |
| Cart | localStorage (works, not persisted server-side) |
| Checkout/Payment | Via Shopify (works) |
| Order history | **Mock data only** -- orders page uses `MOCK_ORDERS` |
| Order tracking | Not implemented |
| Inventory management | Delegated to Shopify |
| Customer accounts | Via Shopify (works) |
| Admin panel | Not implemented |
| Email notifications | Port exists, never used |
| Shipping calculation | Delegated to Shopify checkout |
| Tax calculation | Delegated to Shopify checkout |
| Promotions/Coupons | Not implemented |
| Reviews/Ratings | Mock data only (hardcoded 4.5 stars, 10 reviews) |
| Wishlist/Favorites | localStorage only, per-user keyed |
| Analytics | Not implemented |
| SEO | Basic metadata only |

---

## 14. Architecture Diagrams

### 14.1 System Context

```
                    +------------------+
                    |   Shopify Store   |
                    | (Source of Truth) |
                    +--------+---------+
                             |
              +--------------+---------------+
              |              |               |
     Storefront API    Customer API    Checkout
              |              |               |
    +---------+-----+  +----+----+    +------+------+
    | zenberry-front|  |zenberry-|    | Hosted      |
    | (Next.js 16)  |  |api      |    | Shopify     |
    | - Products    |  |(NestJS) |    | Checkout    |
    | - Search      |  |- Auth   |    +-------------+
    | - Cart (local)|  |- Chat   |
    | - Checkout    |  |- Users  |
    +---------+-----+  +----+----+
              |              |
              +--------------+
                             |
                    +--------+--------+
                    |   PostgreSQL     |
                    | (User + Product) |
                    +---------+-------+
                              |
                    +---------+-------+
                    |  Google Gemini   |
                    |  (via LangChain) |
                    +-----------------+
```

### 14.2 Data Flow Anomaly

```
Product Data Flows (DISCONNECTED):

Flow A (Active):
  Shopify -> Frontend GraphQL -> mapShopifyProductToProduct() -> UI

Flow B (Active for Chatbot):
  Shopify -> Backend ShopifyClient -> ChatProductsService (5min cache) -> AI System Prompt

Flow C (Orphan):
  ??? -> Backend ProductsController -> Prisma Product table -> ???
  (No data source, no data consumer in the main flow)
```

---

## 15. Key Recommendations (Prioritized)

### P0 -- Must Fix Before Production

1. **Replace O(n) token lookup** with indexed lookup. Store a non-sensitive token identifier (e.g., token hash prefix or separate session ID) as an indexed column, then verify with bcrypt only on the single matched row.

2. **Add auth guards to Product CRUD endpoints.** At minimum, add `ShopifyJwtGuard` to POST/PATCH/DELETE. Ideally implement basic RBAC.

3. **Add GOOGLE_AI_API_KEY to EnvSchema** to fail fast on missing config.

### P1 -- Should Fix Soon

4. **Resolve the dual product system.** Either: (a) remove the Prisma Product model and rely fully on Shopify, or (b) implement a sync mechanism. Option (a) is recommended given Zenberry's Shopify-first architecture.

5. **Remove dead infrastructure code.** Delete CacheModule, EmailModule, and the 12 unused injection tokens. They add confusion and maintenance burden.

6. **Fix SSE streaming** to use POST body instead of URL query parameters for chat history.

### P2 -- Should Fix for Quality

7. **Unify frontend Product type** -- remove the backend product service from frontend since it's unused in practice.
8. **Implement order history** via Shopify Orders API instead of mock data.
9. **Enable the LangChain tools** via `bindTools()` for dynamic product search instead of stuffing everything into the prompt.
10. **Add rate limiting to `useChatStream`** hook to match `useChat`.
11. **Fix `AskResponse` type** -- remove `question` field or have backend return it.
12. **Delete stale `User` type** in `user.ts`.

---

## 16. Final Score: 5.8/10

**Rationale:** Zenberry successfully delivers its core value proposition (CBD e-commerce + AI chatbot) as an MVP. The Shopify integration is the strongest part of the architecture. However, the disconnected dual product system, the O(n) auth vulnerability, the complete absence of RBAC on write endpoints, and the massive amount of unused Scafold template code drag the score well below the ecosystem average. The AI architecture is functional but leaves its most sophisticated features (LangChain tools, dynamic RAG) unimplemented in favor of a simpler "stuff the prompt" approach.

Compared to the ecosystem:
- **Below Chorus (6.5)** due to less sophisticated RAG, no i18n, no billing
- **Below Chats (6.3)** due to auth vulnerability and dead code
- **Shopify integration quality is unique** and the best external-service integration in the ecosystem
- **AI chatbot is competent** but architecturally simpler than Vaultly's multi-query RAG

The project needs approximately 2-3 weeks of focused work to reach production-ready status, primarily addressing auth performance, RBAC, and the product data model confusion.
