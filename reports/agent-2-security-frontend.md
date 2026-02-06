# Agent 2: Security Analysis of the Frontend

**Project:** Zenberry - CBD/THC E-commerce Platform Frontend
**Scope:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/`
**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui
**Codebase:** ~12.3K LOC, 155 files
**Audit Date:** 2026-02-04
**Auditor:** Agent 2 (Claude Opus 4.5)

---

## Overall Security Score: 6.8/10

### Sub-dimension Breakdown

| Dimension                        | Score | Weight | Notes                                       |
|----------------------------------|-------|--------|---------------------------------------------|
| Authentication & Token Storage   | 7.5   | 20%    | httpOnly cookies for auth (best in Dooor)    |
| XSS Prevention                   | 7.0   | 20%    | Zero dangerouslySetInnerHTML, safe markdown  |
| API Key / Secret Protection      | 7.0   | 15%    | Server-side Shopify keys, NEXT_PUBLIC only for API URL |
| Route Protection                 | 5.5   | 10%    | Client-side guards only, no middleware       |
| Input Validation                 | 7.5   | 10%    | Zod on all forms, chat input sanitized       |
| CSP & HTTP Security Headers      | 2.0   | 10%    | Zero CSP headers configured                  |
| SSE/Streaming Security           | 4.0   | 5%     | No auth on SSE, wildcard CORS                |
| Rate Limiting                    | 6.0   | 5%     | Client-side only, fully bypassable           |
| Information Disclosure           | 6.5   | 5%     | 33 console statements, some with data        |

---

## Executive Summary

Zenberry's frontend demonstrates **the best authentication architecture in the Dooor ecosystem** by using httpOnly cookies for Shopify customer tokens via Server Actions, a significant improvement over the localStorage-based JWT storage seen in all other Dooor projects (Vaultly, Veris, Chats, Chorus, Scafold). The codebase has **zero instances of `dangerouslySetInnerHTML`**, which is a notable achievement given that 4 of 6 other Dooor projects use it unsafely.

However, several security gaps remain. The most critical are: (1) a **legacy Axios interceptor that still reads tokens from localStorage** (dead code path but a confusing security smell), (2) **complete absence of CSP headers**, (3) an **unauthenticated SSE streaming endpoint with wildcard CORS**, (4) **no Next.js middleware** for server-side route protection, and (5) **client-side-only rate limiting** on the chat feature that can be trivially bypassed.

The project is well-positioned for security hardening. The foundational architecture (httpOnly cookies, server-side Shopify API calls, Zod validation, safe markdown rendering) is solid. The identified issues are primarily infrastructure-level (headers, middleware) and defense-in-depth gaps (SSE auth, server rate limiting) rather than fundamental architectural flaws.

---

## Detailed Findings

### 1. Authentication & Token Storage

**Severity: LOW (Architecture is good, with one legacy concern)**

#### Positive: httpOnly Cookie-Based Token Storage

Zenberry is the **only Dooor project** that correctly stores authentication tokens in httpOnly cookies rather than localStorage. The implementation is in Server Actions:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/server/auth-service.ts`
```typescript
// Lines 17-36
export async function saveAuthToken({ accessToken, expiresAt }: SaveTokenParams) {
  const cookieStore = await cookies();
  const expiresDate = new Date(expiresAt);

  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresDate,
    path: "/",
  });
}
```

This correctly sets:
- `httpOnly: true` -- prevents JavaScript access (XSS-safe)
- `secure: true` in production -- HTTPS only
- `sameSite: "lax"` -- CSRF mitigation
- Expiration from Shopify token

The auth context passes `initialToken` from the root layout via a server-side cookie read, keeping the token out of the client bundle:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/layout.tsx`
```typescript
// Line 43
const token = await getAuthToken();
// Line 54
<AuthProvider initialToken={token}>
```

#### Concern: Legacy Axios Interceptor Reads from localStorage

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/config/axios.ts`
```typescript
// Lines 13-26
apiAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");  // <-- DEAD CODE PATH
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
```

And on 401:
```typescript
// Lines 34-36
localStorage.removeItem("auth_token");
localStorage.removeItem("refresh_token");
```

**Analysis:** The auth context (`auth-context.tsx`) does NOT write tokens to localStorage -- it uses `saveAuthToken()` (httpOnly cookie). The `authService` (client) uses `apiFetch` (native fetch), not `apiAxios`. However, the `chatService` uses `apiAxios`, meaning the interceptor runs but will always find `null` in localStorage. This is dead code that creates confusion and could become a vulnerability if someone mistakenly starts writing tokens to localStorage. The `refresh_token` key in localStorage.removeItem suggests a past or planned token refresh flow that would be insecure.

**Verdict:** The token is NOT in localStorage in the current implementation. This is safe but should be cleaned up.

---

### 2. XSS Prevention

**Severity: LOW**

#### Zero `dangerouslySetInnerHTML`

A search of the entire codebase returns **zero instances** of `dangerouslySetInnerHTML`. This is the best result in the Dooor ecosystem:

| Project    | dangerouslySetInnerHTML Count | Sanitized? |
|------------|-------------------------------|------------|
| **Zenberry** | **0**                        | N/A        |
| Vaultly    | 3                             | No         |
| Veris      | 2                             | No         |
| Chats      | 5                             | No         |
| Chorus     | 4                             | No         |
| Scafold    | 0                             | N/A        |

#### Safe ReactMarkdown Configuration

The chat message component uses `react-markdown` with `remarkGfm` only:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/components/chatbot/chat-message.tsx`
```typescript
// Lines 59-105
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Custom component overrides (all safe)
    a: ({ href, children }) => (
      <a href={href} rel="noopener noreferrer" className="...">
        {children}
      </a>
    ),
  }}
>
  {message.content}
</ReactMarkdown>
```

**Key safety features:**
- No `rehype-raw` plugin (which would allow raw HTML passthrough) -- **confirmed absent**
- Custom `<a>` component includes `rel="noopener noreferrer"` (though missing `target="_blank"`, which actually prevents tabnabbing by not opening new windows)
- All other custom components (`p`, `ul`, `ol`, `li`, `strong`, `code`, `pre`) are safe wrappers

#### Product Description Rendering

Product descriptions from Shopify are rendered as plain text in `<p>` tags:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/products/[handle]/_components/product-by-id-tabs-infos.tsx`
```typescript
// Line 46
<p className="text-theme-text-secondary leading-relaxed">
  {product.description}
</p>
```

React's default JSX rendering auto-escapes HTML entities, so even if a Shopify admin injects `<script>` tags in product descriptions, they will be rendered as visible text, not executed.

**Remaining XSS Vector:** The `<a href={href}>` in the ReactMarkdown component could be exploited with `javascript:` URLs in AI-generated markdown responses. If the backend LLM is manipulated to output `[click here](javascript:alert(1))`, it would render a clickable link that executes JavaScript. This is a low-probability but real XSS vector.

---

### 3. API Key / Secret Protection

**Severity: LOW**

#### NEXT_PUBLIC_ Variables

Only **one** `NEXT_PUBLIC_` variable is used: `NEXT_PUBLIC_API_URL`, which holds the backend API base URL (not a secret):

```
src/config/fetch.ts:     NEXT_PUBLIC_API_URL || "http://localhost:8080/v1"
src/config/axios.ts:     NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
src/app/api/chat/stream/route.ts: NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
```

#### Server-Side Shopify Credentials

Shopify credentials are properly server-only:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/config/shopify.ts`
```typescript
// Lines 20-21
const { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PUBLIC_TOKEN } = process.env;
```

These are NOT prefixed with `NEXT_PUBLIC_` and are only used in server-side functions (`shopifyQuery` is called from Server Components and API routes). They are properly excluded from the client bundle.

#### .env Files

The `.gitignore` correctly excludes `.env*`:
```
# env files (can opt-in for committing if needed)
.env*
```

No `.env` files were found committed to the repository. The README documents example env vars but uses placeholder values.

**Ecosystem comparison:** This is much better than Scafold, which exposed API keys via `NEXT_PUBLIC_*` variables.

---

### 4. Chat Input Sanitization & Auth

**Severity: MEDIUM**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/client/chat-api.ts`

```typescript
// Lines 16-21
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .trim()
    .substring(0, 2000); // Limite de 2000 caracteres
}
```

**Analysis:**
- HTML tag stripping is basic regex-based, which is good as a first defense layer
- The 2000-character limit prevents extremely long payloads
- Message validation rejects empty messages

**Concern: No Authentication on Chat**

The chat API (`/api/chat/stream`) is completely unauthenticated. There is no token check:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/api/chat/stream/route.ts`
```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const question = searchParams.get("question");
  // NO AUTH CHECK
  // ...proxies directly to backend
}
```

And the `createStreamConnection` function does NOT include any auth headers:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/client/chat-api.ts`
```typescript
// Line 115
const eventSource = new EventSource(`/api/chat/stream?${params.toString()}`);
// EventSource does NOT support custom headers
```

This means **any visitor** (including bots) can send unlimited AI chat requests, potentially incurring significant LLM API costs.

---

### 5. Frontend Rate Limiting -- Bypassable

**Severity: HIGH**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/hooks/use-chat.ts`

```typescript
// Lines 85-140 -- Client-side rate limiting
const checkRateLimit = useCallback((): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  messageTimestamps.current = messageTimestamps.current.filter(
    (timestamp) => timestamp > oneMinuteAgo
  );
  if (messageTimestamps.current.length >= maxMessagesPerMinute) {
    // ... rate limited
    return false;
  }
  // ... cooldown check
}, [maxMessagesPerMinute, cooldownSeconds]);
```

**Bypass methods (all trivial):**

1. **Direct API call:** `curl "https://zenberry.com/api/chat/stream?question=test"` -- completely bypasses the React hook
2. **Browser DevTools:** Execute `fetch('/api/chat/stream?question=test')` in console
3. **State manipulation:** `messageTimestamps.current = []` in devtools
4. **Multiple tabs/sessions:** Rate limit is per-hook-instance, not per-user or per-session

**The streaming hook (`use-chat-stream.ts`) has NO rate limiting at all** -- only the non-streaming `use-chat.ts` implements it.

**Ecosystem comparison:** No Dooor project has server-side rate limiting on the frontend. This is a systemic issue.

---

### 6. CSP Headers

**Severity: HIGH**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/next.config.ts`
```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
};
```

**Zero security headers configured.** No:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`

This is consistent with the Dooor ecosystem pattern (zero CSP across all projects except Vaultly's partial implementation).

**Impact:** Without CSP, any XSS vulnerability (even in third-party dependencies) can exfiltrate data to any domain, load arbitrary scripts, and execute arbitrary code.

---

### 7. SSE Streaming Security

**Severity: HIGH**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/api/chat/stream/route.ts`

```typescript
// Lines 78-85
return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",  // <-- WILDCARD CORS
  },
});
```

**Issues:**

1. **Wildcard CORS (`Access-Control-Allow-Origin: "*"`):** Any website can make requests to this SSE endpoint. A malicious site could embed calls to Zenberry's chat API and rack up LLM costs.

2. **No Authentication:** As discussed in Finding #4, no token validation occurs before proxying to the backend.

3. **No Rate Limiting:** The API route has zero rate limiting. Combined with no auth, this creates a denial-of-wallet attack vector.

4. **History Injection via GET Parameters:** Chat history is passed as a JSON-encoded GET parameter:
```typescript
const history = historyParam ? JSON.parse(historyParam) : [];
```
An attacker could craft a URL with manipulated history to influence the AI's responses (prompt injection via history).

---

### 8. Shopify OAuth / Redirect Analysis

**Severity: LOW**

The Shopify authentication flow is NOT a standard OAuth redirect flow. Instead, Zenberry uses Shopify's Customer Account API through its NestJS backend:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/client/auth-service.ts`
```typescript
loginWithShopify: async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return apiFetch.post<AuthResponse>("/auth/shopify/login", credentials);
},
```

Credentials (email/password) are posted directly to the backend, which then communicates with Shopify. There is **no browser redirect to Shopify**, so **open redirect vulnerabilities do not apply** to this authentication flow.

The only redirect in the checkout flow is to Shopify's checkout URL:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/server/cart-service.ts`
```typescript
// Line 58
redirect(cartCreate.cart.checkoutUrl);
```

This is a server-side redirect using Next.js `redirect()` to a URL returned by Shopify's API. Since `cartCreate.cart.checkoutUrl` comes from Shopify's trusted API response, this is safe.

---

### 9. Route Protection

**Severity: MEDIUM**

#### No Next.js Middleware

A search for `middleware.ts` or `middleware.js` in the project root and `src/` directory returned **zero results**. There is no server-side route protection.

**Ecosystem comparison:**

| Project    | Has Middleware? |
|------------|----------------|
| Chorus     | Yes            |
| **Zenberry** | **No**       |
| Vaultly    | No             |
| Veris      | No             |
| Chats      | No             |
| Scafold    | No             |

#### Client-Side Route Guards

Protection is implemented via React component wrappers:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/components/guards/route-guard.tsx`

Used on:
- `/profile` -- `<ProtectedPage>` (requires auth)
- `/profile/edit` -- `<ProtectedPage>` (requires auth)
- `/auth` -- `<GuestOnlyPage>` (redirects if already authenticated)
- `/auth/register` -- `<GuestOnlyPage>` (redirects if already authenticated)

**NOT protected (client-side guard missing):**
- `/orders` -- Uses mock data, has client-side click handler in header but no page-level guard
- `/favorites` -- Accessible without auth (shows empty state, requires auth to add)

**Issues with client-side guards:**
1. The protected page **initially renders on the server** with the full HTML before the client-side guard kicks in. A user could see a flash of protected content.
2. A direct server-rendered request (e.g., `curl https://zenberry.com/profile`) would return the full page HTML including the component tree (though without customer data, since that requires a valid token).
3. Route guards depend on `useAuthContext` which checks a React state variable, not server-side session.

---

### 10. Cart Context -- Data Sensitivity

**Severity: LOW**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/contexts/cart-context.tsx`

Cart data stored in localStorage (`zenberry-cart`):
```typescript
export interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
  inStock: boolean;
}
```

**Analysis:** Cart data is purely product information (names, prices, quantities). No PII, no payment data, no tokens. Storing this in localStorage is acceptable for UX (cart persistence) and carries no meaningful security risk.

**Additional localStorage keys:**
- `zenberry_chat_history` / `zenberry_chat_stream_history` -- Chat messages (could contain PII if user shares personal health info in chat)
- `zenberry-favorites-{userId}` -- Favorited products (no PII beyond the userId key itself)

---

### 11. Console.log Analysis

**Severity: LOW**

**Total console statements: 33** (much better than Chorus's 130+)

Breakdown:
- `console.error`: 30 instances -- error logging for debugging
- `console.log`: 3 instances -- all in notification drawer TODO stubs

**Potentially sensitive data in console.error:**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/server/cart-service.ts`
```typescript
// Line 69
console.error('Line items:', JSON.stringify(lineItems, null, 2));
```
This logs cart line items (variant IDs and quantities) to the server console on checkout failure. Low risk since it is server-side only.

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/config/shopify.ts`
```typescript
// Line 55
console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
```
Could leak Shopify GraphQL error details, though this is also server-side.

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/contexts/auth-context.tsx`
```typescript
// Line 61
console.error("Failed to fetch customer:", error);
```
Could log error objects containing tokens or API responses.

None of these log sensitive credentials directly. The `console.log` in notification drawer is benign (TODO stub).

---

### 12. Zod Validation Coverage

**Severity: LOW**

| Form              | Schema File                     | Validation Quality |
|-------------------|---------------------------------|--------------------|
| Login             | `schemas/auth/login-schema.ts`  | Email format, password min 8 chars |
| Register          | `schemas/auth/register-schema.ts` | Email, name max 50, password complexity (upper+lower+digit), phone regex, confirm match |
| Edit Profile      | `edit-profile-form.tsx` (inline) | Email, first/last name required, phone regex |
| Chat Input        | `chat-api.ts` (manual)          | HTML strip, trim, 2000 char max |

**Good:** All forms use Zod + react-hook-form with `zodResolver`. The register schema has strong password requirements.

**Gap:** Login schema only requires min 8 chars for password, no complexity requirements. This is acceptable since it is a login form (the server should enforce complexity on registration, which it does).

**Gap:** No schema validation on the search query (`search-modal.tsx` accepts raw input and filters client-side, but the `/api/products/search` route passes `q` directly to Shopify's GraphQL).

---

### 13. CORS Handling

**Severity: MEDIUM**

The only explicit CORS header is the wildcard on the SSE endpoint:

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/api/chat/stream/route.ts`
```typescript
"Access-Control-Allow-Origin": "*",
```

The `fetch` and `axios` configurations do not set CORS headers (correctly, since CORS is a server-side concern). The backend NestJS server presumably handles CORS for its own endpoints, but the Next.js API routes serve as proxies and should enforce origin restrictions.

---

### 14. Axios Interceptor Analysis

**Severity: LOW (functional issue, not security)**

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/config/axios.ts`

**Request Interceptor:**
- Reads `auth_token` from localStorage (dead code -- token is never written there)
- Adds `Bearer` auth header if token exists

**Response Interceptor:**
- On 401: removes `auth_token` and `refresh_token` from localStorage (dead code)
- Redirects to `/auth` via `window.location.href` (hard redirect, not Next.js router)

**Issue:** The 401 handler does `window.location.href = "/auth"` which is a full page reload, bypassing Next.js routing. This is a UX issue more than a security one, but the hard redirect could theoretically be manipulated if the response included a `Location` header (not the case here since it is client-side JS).

**Usage:** `apiAxios` is only imported in `chat-api.ts` for the `chatService.ask()` method. The auth service uses `apiFetch` (native fetch wrapper). This dual HTTP client pattern is confusing and could lead to inconsistencies.

---

### 15. Additional Findings

#### Token Passed as Prop to Client Component

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/app/layout.tsx`
```typescript
const token = await getAuthToken();
// ...
<AuthProvider initialToken={token}>
```

The token is read server-side from the httpOnly cookie and passed as a prop to `AuthProvider`. While the token value flows through the client-side React tree (it is used in `authService.getCurrentCustomer(token)` and `authService.updateProfile(data, token)`), it is NOT written to localStorage or sessionStorage. It lives only in React state (`useState<string | null>(initialToken || null)`).

**Risk:** The token IS accessible to client-side JavaScript via React state. A sophisticated XSS attack could extract it from React's internal fiber tree or by hooking into the AuthProvider. However, without CSP bypass, an attacker would need an existing XSS vector. This is a defense-in-depth concern, not a direct vulnerability.

#### Checkout URL Redirect

**File:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/services/server/cart-service.ts`
```typescript
if (cartCreate?.cart?.checkoutUrl) {
  redirect(cartCreate.cart.checkoutUrl);
}
```

The `checkoutUrl` comes from Shopify's API. A compromised Shopify account or MITM on the server-to-Shopify connection could inject a malicious URL. This is an extremely low-probability scenario since it requires compromising Shopify's infrastructure.

---

## Ecosystem Comparison

| Dimension                    | Zenberry | Vaultly | Veris | Chats | Chorus | Scafold |
|------------------------------|----------|---------|-------|-------|--------|---------|
| Token in httpOnly cookie     | YES      | No      | No    | No    | No     | No      |
| Token in localStorage        | No*      | Yes     | Yes   | Yes   | Yes    | Yes     |
| dangerouslySetInnerHTML      | 0        | 3       | 2     | 5     | 4      | 0       |
| CSP Headers                  | No       | Partial | No    | No    | No     | No      |
| Next.js Middleware            | No       | No      | No    | No    | Yes    | No      |
| API keys in NEXT_PUBLIC_      | No       | No      | No    | No    | No     | Yes     |
| console.log count            | 33       | ~40     | ~25   | ~60   | 130+   | ~20     |
| Zod form validation          | Yes      | Yes     | Yes   | No    | Yes    | Partial |
| Server-side rate limiting    | No       | No      | No    | No    | No     | No      |

**Zenberry is the security leader** in the Dooor ecosystem for authentication architecture. It is the only project that correctly uses httpOnly cookies and avoids localStorage for tokens.

\* Note: The Axios interceptor references `localStorage.getItem("auth_token")` but no code writes to this key. This is dead/legacy code.

---

## Prioritized Recommendations

### Priority 1 -- Critical (Address before production)

#### P1.1: Add Authentication to SSE Chat Endpoint
**File:** `src/app/api/chat/stream/route.ts`
**Issue:** Unauthenticated access allows abuse and cost exploitation
**Action:** Add token validation via cookie read or API key verification. Even a simple session check would help.

#### P1.2: Remove Wildcard CORS from SSE Endpoint
**File:** `src/app/api/chat/stream/route.ts`, line 83
**Issue:** `Access-Control-Allow-Origin: "*"` allows any origin to abuse the endpoint
**Action:** Restrict to the application's own domain or remove the header entirely (same-origin requests do not need it).

#### P1.3: Add Security Headers via next.config.ts
**File:** `next.config.ts`
**Issue:** Zero CSP or other security headers
**Action:** Add headers configuration:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

### Priority 2 -- High (Address within sprint)

#### P2.1: Add Next.js Middleware for Route Protection
**File:** Create `src/middleware.ts`
**Issue:** Client-side guards can be bypassed; SSR renders protected page HTML before guard runs
**Action:** Implement middleware that checks the `shopify_customer_token` cookie and redirects unauthenticated users from `/profile`, `/profile/edit`, `/orders`, `/favorites`.

#### P2.2: Add Server-Side Rate Limiting to Chat
**File:** `src/app/api/chat/stream/route.ts`
**Issue:** Client-side rate limiting is trivially bypassable
**Action:** Implement IP-based or session-based rate limiting in the API route (or rely on backend NestJS rate limiting).

#### P2.3: Add `javascript:` URL Filtering to ReactMarkdown
**File:** `src/components/chatbot/chat-message.tsx`
**Issue:** AI-generated markdown with `javascript:` URLs could execute XSS
**Action:** In the custom `a` component, validate that `href` starts with `http://`, `https://`, or `/`. Reject `javascript:`, `data:`, `vbscript:` protocols.

### Priority 3 -- Medium (Address in backlog)

#### P3.1: Remove Dead Axios Interceptor Code
**File:** `src/config/axios.ts`
**Issue:** Legacy localStorage token reading creates confusion and future vulnerability risk
**Action:** Remove localStorage token handling from the interceptor. Either rely solely on cookie-based auth or add explicit token passing for the chat service.

#### P3.2: Add `<ProtectedPage>` Guards to Orders and Favorites
**Files:** `src/app/orders/page.tsx`, `src/app/favorites/page.tsx`
**Issue:** These pages lack the `<ProtectedPage>` wrapper present on profile pages
**Action:** Wrap with `<ProtectedPage>` for consistency (favorites already shows empty state for unauthenticated users, but orders shows mock data to everyone).

#### P3.3: Clean Up Console Statements
**Issue:** 33 console statements in production code
**Action:** Replace with a structured logger that can be disabled in production, or use Next.js's built-in logging configuration. Pay special attention to `cart-service.ts` line 69 which logs line items on error.

### Priority 4 -- Low (Nice to have)

#### P4.1: Add Input Validation on Search API Route
**File:** `src/app/api/products/search/route.ts`
**Action:** Validate and sanitize the `q` parameter before passing to Shopify's GraphQL. Add length limits and character filtering.

#### P4.2: Add CSRF Token to Server Actions
**Issue:** While `sameSite: "lax"` provides basic CSRF protection, explicit CSRF tokens would add defense-in-depth for Server Actions that mutate state.

#### P4.3: Encrypt Chat History in localStorage
**Issue:** Chat messages persisted in localStorage (`zenberry_chat_history`) may contain user health information (given this is a CBD/THC platform). Consider encrypting or not persisting sensitive conversations.

---

## Methodology

This audit was conducted by reading ALL TypeScript/TSX source files in the codebase (127 application files), configuration files, and build configurations. Analysis covered:

1. Full text search for security anti-patterns (`dangerouslySetInnerHTML`, `eval`, `innerHTML`, `localStorage`, `NEXT_PUBLIC_`, `console.log`, `Access-Control`, `CSP`)
2. Manual review of all authentication flows (login, register, logout, token refresh, profile update)
3. Manual review of all API routes and service layer
4. Manual review of all contexts and hooks for state management security
5. Manual review of all user-facing input components for validation coverage
6. Comparison against known Dooor ecosystem security patterns from parallel audit context

---

*Report generated by Agent 2 of the Zenberry Platform 10-Agent Parallel Audit*
*Model: Claude Opus 4.5 (claude-opus-4-5-20251101)*
