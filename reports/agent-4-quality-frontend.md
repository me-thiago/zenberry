# Agent 4 -- Frontend Code Quality Analysis

**Project:** Zenberry Frontend (CBD/THC E-commerce with AI Chatbot)
**Scope:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/src/`
**Stack:** Next.js 16.0.7 + React 19.2 + TypeScript 5 (strict) + Tailwind CSS 4 + shadcn/ui + React Query 5 + React Hook Form 7 + Zod 4 + embla-carousel 8 + Axios + sonner
**Stats:** 155 files, 12,337 LOC, 53 client components, ~102 server-side / non-directive files

---

## 1. `any` Usage -- Distribution by Area

**Total `any` count: 3** (code-level `any` type annotations)

| File | Line | Usage | Justified? |
|------|------|-------|------------|
| `services/server/cart-service.ts:36` | `const cartInput: any = {` | eslint-disable-next-line above | Partially -- Shopify cart input type was not defined |
| `services/server/product-service.ts:10` | `function normalizeProduct(product: any): Product` | eslint-disable-next-line above | No -- should accept `unknown` and narrow |
| `config/shopify.ts:58` | `.map((e: any) => e.message)` | GraphQL error array | No -- `e` could be typed as `{message: string}` |

**Verdict:** 3 `any` is **outstanding** for a 12K LOC codebase. All 3 are acknowledged with eslint-disable comments, showing awareness. This is the best `any` count in the entire ecosystem (Chorus: 112, Scafold: 79, Vaultly: unknown). The one in `normalizeProduct` is the most concerning since it handles API response mapping without type narrowing.

**Score: 9.5/10**

---

## 2. TypeScript Configuration -- Strict Mode Status

```json
{
  "strict": true,
  "target": "ES2017",
  "module": "esnext",
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "isolatedModules": true,
  "skipLibCheck": true,
  "noEmit": true,
  "incremental": true,
  "paths": { "@/*": ["./*"] }
}
```

**Analysis:**
- `strict: true` -- enables all strict sub-flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.)
- `isolatedModules: true` -- correct for Next.js/bundler usage
- `moduleResolution: "bundler"` -- modern and correct for Next.js 16
- Path alias `@/*` configured for clean imports

**Missing potentially beneficial flags:**
- `noUncheckedIndexedAccess` -- would catch array indexing issues
- `forceConsistentCasingInFileNames` -- useful for cross-platform
- `exactOptionalPropertyTypes` -- stricter optional handling

**Score: 8.5/10**

---

## 3. Files > 300 Lines

| File | Lines | Assessment |
|------|-------|------------|
| `components/home/questions-form.tsx` | 405 | Quiz logic + rendering in one file; data definitions inflate LOC. Acceptable for self-contained component. |
| `app/auth/register/_components/register-card.tsx` | 380 | Form with 6 fields + phone formatting logic. Could extract phone input as reusable component. |
| `components/chatbot/chat-interface.tsx` | 368 | Complex chat UI with streaming + non-streaming modes. Dual-hook pattern adds bulk. |
| `data/mock-products.ts` | 341 | Mock data -- line count is irrelevant for data files. |
| `app/profile/edit/_components/edit-profile-form.tsx` | 313 | Duplicated phone handling logic from register-card. Clear DRY violation. |

**Key observation:** The register form and edit profile form share nearly identical phone input logic (~70 lines duplicated). This is the most notable DRY violation in the codebase.

**Score: 7.0/10**

---

## 4. Component Directory Organization (21 directories in `components/`)

### Shared Components (`src/components/`)
| Directory | Files | Purpose | Cohesion |
|-----------|-------|---------|----------|
| `badge/` | 1 | `discount-badge.tsx` | Good -- single responsibility |
| `button/` | 3 | `add-to-cart`, `back-button`, `buy-now` | Good -- reusable action buttons |
| `cart/` | 4 | `cart-drawer`, `cart-footer`, `cart-item`, `free-shipping-progress` | Excellent -- complete cart feature |
| `chatbot/` | 6 | Full chatbot UI: modal, interface, messages, suggestions, clear confirmation | Excellent -- well-decomposed |
| `filter/` | 1 | `filter-section.tsx` | Good -- reusable filter UI primitive |
| `footer/` | 1 | Site footer | Good |
| `guards/` | 3 | `route-guard`, `protected-page`, `guest-only-page` | Excellent -- clean composition pattern |
| `header/` | 1 | Site header (237 lines, slightly heavy) | Acceptable |
| `hero/` | 1 | Reusable hero section | Good |
| `hero-cta/` | 1 | CTA hero variant | Good |
| `home/` | 5 | Home-specific: carousels, quiz, hero | Good -- page-scoped |
| `layout/` | 2 | `base-layout` + types | Excellent -- layout composition |
| `loader/` | 1 | Branded loading animation | Good |
| `notifications/` | 2 | Drawer + item | Good |
| `orders/` | 1 | Order accordion | Good |
| `products/` | 5 | Shared product components: carousels, cards, filters, suggestions | Good |
| `search-modal/` | 3 | Search modal, cards, suggestions | Good |
| `star-rating/` | 1 | Rating display | Good |
| `ui/` | 10 | shadcn/ui primitives | Standard |

### Page-Scoped Components (`app/*/_components/`)
The project correctly uses Next.js `_components` convention for page-specific components:
- `about/_components/` (4 files)
- `auth/_components/` + `auth/register/_components/` (2 files)
- `benefits/_components/` (3 files)
- `favorites/_components/` (2 files)
- `orders/_components/` (2 files)
- `products/_components/` (6 files)
- `products/[handle]/_components/` (16 files)
- `profile/_components/` + `profile/edit/_components/` (4 files)

**Key strengths:**
- Clean separation between shared (`components/`) and page-scoped (`_components/`)
- Product detail page has 16 focused sub-components -- excellent decomposition
- Guard components compose well with layout
- No barrel files (index.ts) -- direct imports, which is fine at this scale

**Score: 8.5/10**

---

## 5. Custom Hooks Analysis (6 hooks)

| Hook | Lines | Quality Assessment |
|------|-------|--------------------|
| `use-chat.ts` | 243 | **Strong.** Rate limiting, cooldown timer, message validation, history persistence. Well-documented with JSDoc. Uses proper refs for timers. |
| `use-chat-stream.ts` | 270 | **Strong.** SSE streaming with reconnection logic, proper EventSource cleanup on unmount, cancelation support. |
| `use-favorites.ts` | 111 | **Strong.** localStorage persistence with hydration guard, cross-tab sync via StorageEvent, user-scoped storage keys. |
| `use-protected-action.ts` | 71 | **Excellent.** Clean abstraction for auth-gated actions. Good default messages, configurable redirect. |
| `use-route-protection.ts` | 84 | **Good.** Handles both "require auth" and "guest only" flows. Uses ref to prevent double-redirect. |
| `use-search-products.ts` | 75 | **Adequate.** Simple module-level cache (not React state). Works but breaks if used in multiple instances. Global mutable state is fragile. |

**Key observations:**
- Hooks are well-separated by concern (chat, auth, favorites, search)
- `use-chat` and `use-chat-stream` share some patterns (localStorage persistence, message validation) that could be extracted into a shared utility
- `useCallback` and `useMemo` are used appropriately throughout
- All hooks include proper cleanup in useEffect returns

**Score: 8.0/10**

---

## 6. Context Analysis (Auth, Cart, Chatbot)

### AuthContext (192 lines)
- **State:** `customer`, `isLoading`, `token`, `initialized`
- **Pattern:** Server Action for cookie management (`saveAuthToken`/`clearAuthToken`), client-side state sync
- **Strengths:** httpOnly cookie pattern is security-conscious; `initialToken` prop from server layout avoids flash; clear separation between auth operations
- **Issues:** No error state exposed to consumers; `loginWithCredentials`/`registerWithCredentials` don't catch errors (they rely on callers to handle)

### CartContext (149 lines)
- **State:** `cartItems`, `isCartOpen`, `isHydrated`
- **Pattern:** localStorage persistence with hydration guard, cross-tab sync
- **Strengths:** Derived values (`cartCount`, `cartTotal`) computed on render; proper hydration handling prevents SSR mismatch
- **Issues:** Cart is client-only (localStorage). No server-side cart persistence. For e-commerce this is a limitation but acceptable for MVP.

### ChatbotContext (60 lines)
- **State:** `isOpen`, `initialMessage`, `initialCategory`
- **Pattern:** Simple open/close + initial message injection for contextual chat
- **Strengths:** Lightweight; `openChatbotWithMessage` enables category carousel -> chatbot flow

**Overall context pattern:** All 3 follow the same pattern: `createContext<T | undefined>`, provider with hook that throws on missing context. Consistent and correct.

**Score: 8.0/10**

---

## 7. React Query Patterns (TanStack Query 5)

### Configuration (`query-provider.tsx`)
```typescript
staleTime: 1000 * 60 * 5,  // 5 minutes
gcTime: 1000 * 60 * 10,    // 10 minutes (correctly uses gcTime, not cacheTime)
retry: (failureCount, error) => {
  if (isClientError(error)) return false;  // No retry on 4xx
  return failureCount < 3;
},
refetchOnWindowFocus: false,
refetchOnReconnect: true,
mutations: { retry: false }
```

**Assessment:**
- Configuration is thoughtful and well-documented
- `gcTime` correctly named (v5 migration done properly)
- Smart retry logic distinguishing client vs server errors
- `refetchOnWindowFocus: false` is appropriate for e-commerce (prevents cart flickers)

**Critical observation:** React Query is **installed and configured but barely used for data fetching**. The codebase relies on:
1. Server Components with `shopifyQuery()` for Shopify data (correct for RSC)
2. Direct `fetch` in `useSearchProducts` hook
3. Direct `apiAxios` calls in chat service
4. `apiFetch` wrapper for product/auth services

React Query's `useQuery`/`useMutation` hooks are **not used anywhere** in the codebase. The `QueryClient` and `QueryClientProvider` are set up but only provide the devtools. This is wasted infrastructure -- but it does not indicate low quality, just unused potential.

**Score: 6.5/10** (well-configured but essentially unused)

---

## 8. "use client" vs Server Components

**Distribution:**
- `"use client"` files: **53** (34% of 155 files)
- Server-side / no directive: **102** (66% of files)

**Server Components used effectively for:**
- `app/layout.tsx` -- Root layout (async, reads auth cookie server-side)
- `app/page.tsx` -- Home page (composes server components)
- `app/products/page.tsx` -- Products listing (ISR with `revalidate = 60`)
- `app/products/[handle]/page.tsx` -- Product detail (async, server-side Shopify fetch)
- `components/products/products-suggestion.tsx` -- Server-side Shopify collection fetch
- `components/home/questions-form-wrapper.tsx` -- Server data fetcher wrapping client quiz
- `components/home/featured-cbd-thc.tsx` -- Server-side collection fetch
- `app/products/_components/products-data-fetcher.tsx` -- Server Component data fetcher
- `app/products/[handle]/_components/product-by-id-data-fetcher.tsx` -- Server fetch
- `services/server/auth-service.ts` -- "use server" actions for cookies
- `services/server/cart-service.ts` -- "use server" for Shopify cart creation

**Pattern:** The codebase follows the "Data Fetcher" pattern well -- server components fetch data, then pass it as props to client components. This is textbook Next.js 16 usage.

**Concerns:**
- `components/footer/footer.tsx` has `"use client"` but contains no interactivity -- could be a server component
- `components/layout/base-layout.tsx` has `"use client"` which forces all children to be client components in terms of bundling (though server components within still run on server)

**Score: 8.5/10** (excellent RSC/client boundary management)

---

## 9. React Hook Form + Zod Validation

### Schemas
| Schema | File | Validation |
|--------|------|------------|
| `loginSchema` | `schemas/auth/login-schema.ts` | email (required + format), password (min 8 chars) |
| `registerSchema` | `schemas/auth/register-schema.ts` | firstName, lastName, email, phone (optional, US format), password (complexity), confirmPassword (match), acceptsMarketing |
| Inline `profileSchema` | `app/profile/edit/_components/edit-profile-form.tsx` | Same as register minus password |

**Coverage:**
- Login form: Zod + RHF with `zodResolver` -- correct
- Register form: Zod + RHF with `zodResolver`, `mode: "onChange"`, `criteriaMode: "all"` -- excellent for real-time validation
- Edit profile: Inline Zod schema (should be extracted to `schemas/`)
- Password complexity: uppercase + lowercase + digit regex
- Phone: US format `+1XXXXXXXXXX` with custom formatting display

**Issues:**
- Profile edit schema is defined inline rather than in `schemas/` directory -- inconsistency
- Phone formatting logic is duplicated between register and edit profile forms
- No Zod schema for checkout/cart operations

**Score: 7.5/10**

---

## 10. shadcn/ui Usage -- Modified or Pure?

**Components installed (10):**
`accordion`, `badge`, `button`, `card`, `checkbox`, `input`, `label`, `navigation-menu`, `separator`, `tabs`

**Assessment:**
- `button.tsx` -- **Pure shadcn/ui** (uses `cva`, `Slot`, standard variants). Added `icon-sm` and `icon-lg` size variants -- reasonable extension.
- `input.tsx` -- **Pure shadcn/ui**
- `label.tsx`, `checkbox.tsx`, `separator.tsx`, `tabs.tsx`, `accordion.tsx`, `badge.tsx`, `card.tsx`, `navigation-menu.tsx` -- **Pure shadcn/ui**

All UI primitives use the standard shadcn/ui pattern with `cn()` utility, `data-slot` attributes, and Radix UI primitives underneath. No modifications to core behavior, only the addition of size variants to Button which is standard practice.

**Consistency:** All shadcn/ui components follow identical patterns. The `cn()` utility from `lib/utils.ts` is used consistently throughout.

**Score: 9.0/10**

---

## 11. Tailwind CSS 4 -- Design Tokens

### Theme System
The project uses Tailwind CSS 4's `@theme inline` directive with CSS custom properties:

```css
@theme inline {
  --color-theme-bg-primary: var(--theme-bg-primary);
  --color-theme-bg-secondary: var(--theme-bg-secondary);
  --color-theme-accent-primary: var(--theme-accent-primary);
  --color-theme-accent-secondary: var(--theme-accent-secondary);
  --color-theme-accent-tertiary: var(--theme-accent-tertiary);
  --color-theme-text-primary: var(--theme-text-primary);
  --color-theme-text-secondary: var(--theme-text-secondary);
}
```

**Color palette (Zenberry brand):**
- Primary green: `#06ef7e`
- Secondary teal: `#024653`
- Accent purple: `#8b53fe`
- Light backgrounds: `#f5f5f5` / `#ededed`

**Usage consistency:**
- Theme tokens are used consistently: `text-theme-text-primary`, `bg-theme-bg-secondary`, `text-theme-accent-secondary`
- `transition-colors duration-200` is applied consistently to themed elements (preparing for potential dark mode)
- Glass effect (`backdrop-blur-xl bg-[#555555]/40`) is used consistently for header/search overlays

**Issues:**
- Some hardcoded colors exist: `bg-[#e0e0e0]` in chatbot, `bg-[#555555]/30` in quiz, `bg-[#024653]` in category carousel
- No dark mode defined (only light `:root` variables)
- The `transition-colors duration-200` pattern is applied to nearly every element, which is excessive for elements that don't change color

**Score: 7.5/10**

---

## 12. Embla Carousel Analysis

**Usage:** 3 carousel components using `embla-carousel-react` v8.6.0

| Component | Config | Features |
|-----------|--------|----------|
| `ProductCarousel` | `loop: false, align: "start", containScroll: "trimSnaps"` | Prev/next arrows, dot navigation, responsive slide sizes |
| `FeaturedProductCarousel` | Same config | Same features + product cards with links |
| `CategoryCarousel` | `loop: true, align: "start"` | Same + click-to-chat integration |

**Performance:**
- Proper cleanup: `emblaApi.off("select", onSelect)` in useEffect cleanup
- Responsive slide sizes: `flex-[0_0_280px] sm:flex-[0_0_300px] md:flex-[0_0_320px]`
- Navigation arrows hidden on mobile (touch-first)

**Accessibility:**
- Arrow buttons have `aria-label="Previous products"` / `"Next products"`
- Dot buttons have `aria-label="Go to slide ${index + 1}"`
- Missing: no `role="region"` or `aria-roledescription="carousel"` on container
- Missing: no keyboard navigation for slides (arrow key support)
- Missing: no `aria-live` region for slide changes

**Code duplication:** `ProductCarousel` and `FeaturedProductCarousel` share ~80% identical carousel logic. This could be extracted into a shared hook or HOC.

**Score: 7.0/10**

---

## 13. Accessibility Audit

**Positive findings (60 aria-related occurrences across 34 files):**
- `aria-label` on icon buttons (header, chatbot, carousel navigation)
- `aria-hidden="true"` on decorative background images
- `htmlFor` on all form labels (Login, Register, Profile forms)
- Keyboard support: Escape key closes cart drawer, search modal, chatbot
- Focus management: auto-focus on search input when modal opens
- Enter key sends chat messages, Shift+Enter for newline

**Missing or insufficient:**
- **No skip-to-content link** -- critical for keyboard users
- **No focus trap** in modals/drawers (cart drawer, search modal, chatbot modal)
- **No `role="dialog"`** on any modal/drawer
- **No `aria-modal="true"`** on modals
- **No `aria-expanded`** on toggle buttons (filter sections, mobile menu)
- **No screen reader announcements** for dynamic content (cart count changes, toast messages, chat responses)
- Image thumbnails in gallery use `alt="Zenberry"` instead of descriptive alt text
- Form error messages not linked with `aria-describedby`
- Star rating component lacks screen reader text
- Footer social media links use `href="#"` with no `aria-label`

**Score: 4.5/10** (basic keyboard support exists but no WCAG 2.1 compliance effort)

---

## 14. Responsive Design -- Mobile-First

**Evidence of responsive patterns:**
- Grid breakpoints: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Show/hide: `hidden sm:block`, `hidden md:flex`, `block sm:hidden`
- Responsive text: `text-3xl md:text-5xl`
- Mobile-specific logo (`logo-zenberry-icon.webp` on small screens)
- Mobile viewport handling: `100dvh` for chatbot, safe-area inset support (`env(safe-area-inset-bottom)`)
- Scrollable nav bar on mobile: `overflow-x-auto scrollbar-hide`
- Mobile keyboard adjustments in chat CSS

**E-commerce specific:**
- Product cards use responsive flex sizes in carousels
- Cart drawer is full-width on mobile, max-width on desktop
- Search modal adapts grid layout for mobile
- Chatbot is full-screen on mobile, floating window on desktop

**Issues:**
- Filter sidebar: `fixed lg:sticky` -- good mobile/desktop handling
- No explicit `touch-action` optimization for carousel swiping
- Product detail image gallery grid may not stack well on very small screens

**Score: 8.0/10** (strong mobile-first patterns for e-commerce)

---

## 15. SEO Analysis (CRITICAL for E-commerce)

### Metadata
```typescript
// layout.tsx - Root only
export const metadata: Metadata = {
  title: "Zenberry",
  description: "CBD and THC products e-commerce platform",
  icons: { ... }
};
```

**Critical gaps:**
- **No per-page metadata** -- only root layout has metadata. Product pages, category pages, about page all lack specific titles/descriptions
- **No `generateMetadata`** on product detail pages -- this is the #1 SEO requirement for e-commerce (dynamic title: "Product Name | Zenberry", dynamic description from product description)
- **No Open Graph tags** -- no `og:title`, `og:image`, `og:description` for social sharing
- **No Twitter Card meta tags**
- **No structured data (JSON-LD)** -- no Product schema, no Organization schema, no BreadcrumbList schema. This is critical for Google Shopping and rich snippets.
- **No canonical URLs**
- **No `robots.txt` configuration** in app router
- **No `sitemap.xml` generation**
- **No `alt` text strategy** for product images -- some use product names, others use "Zenberry"

**Positive:**
- `<html lang="en">` is set
- `<meta name="viewport">` is explicit
- Uses semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`)
- Product pages use Suspense with loading state (good for Core Web Vitals)
- ISR with `revalidate: 60` on product pages (good for freshness)
- Next.js `Image` component used consistently (automatic WebP, lazy loading)

**Score: 3.0/10** (bare minimum; critical failure for an e-commerce site)

---

## 16. Component Patterns

### Composition
- **BaseLayout** pattern is excellent: configurable via `LayoutConfig` object, composes header/footer/cart/chatbot
- **Data Fetcher** pattern: `ProductsDataFetcher` (server) -> `ProductsContent` (client) -- clean RSC boundary
- **Guard composition**: `ProtectedPage` -> `RouteGuard` -> `useRouteProtection` -- layered abstraction

### Props Drilling
- **Minimal props drilling** observed. Contexts handle cross-cutting concerns (auth, cart, chatbot)
- Product detail page passes `product` prop through 1-2 levels maximum
- Cart footer receives calculated values rather than re-computing

### Render Optimization
- `useMemo` for derived state: cart calculations, filtered products, recommended products
- `useCallback` for event handlers throughout (carousels, forms, chat)
- `useTransition` for form submissions (login, register, checkout) -- prevents UI blocking
- **No `React.memo`** wrappers on any component -- given the component sizes and update patterns, this is acceptable

### Patterns quality:
- **State colocation**: State is kept close to where it's used
- **Derived state**: Computed in render/useMemo rather than stored separately
- **Effect cleanup**: Consistently implemented across hooks and components

**Score: 8.0/10**

---

## 17. Error Boundaries

**Error boundary status: NONE**

- No `error.tsx` files anywhere in the app directory
- No `global-error.tsx`
- No custom `ErrorBoundary` components
- No React error boundary classes or wrappers

**Impact:** Any uncaught rendering error will crash the entire page with no recovery UI. For an e-commerce site, this is a significant risk -- a single product card rendering error could take down the entire product listing.

**Existing error handling (non-boundary):**
- API errors: try/catch with console.error and toast notifications
- Loading states: Suspense boundaries with fallback loaders
- Empty states: Explicit empty state components for cart, favorites, orders
- Data fetcher errors: Inline error UI in `ProductsDataFetcher` and `ProductByIdDataFetcher`

**Score: 2.0/10** (complete absence of error boundaries)

---

## 18. Sonner Toast Usage

**Distribution: 17 toast calls across 11 files**

| Type | Count | Examples |
|------|-------|---------|
| `toast.error()` | 11 | Login failure, out of stock, auth required, profile update failure |
| `toast.success()` | 3 | Account created, product added to cart, profile updated |
| `toast.info()` | 1 | Already authenticated redirect |
| `toast()` (plain) | 1 | Placeholder "Implement alert function!" |

**Configuration:**
```typescript
<Toaster richColors closeButton expand={true} theme="light" position="top-right" />
```

**Assessment:**
- Consistent pattern: operations have success + error toasts
- Error messages are user-friendly
- `richColors` provides visual distinction between success/error/info
- `closeButton` allows dismissal
- Position `top-right` is standard

**Issues:**
- Language inconsistency: most toasts are in English, but some in Portuguese ("Voce precisa estar logado...")
- One placeholder toast: `toast("Implement alert function!")` in AddToCartButton for out-of-stock alert
- No toast for checkout success (redirect handles this)
- No loading toasts (e.g., `toast.promise()`) for long operations

**Score: 7.0/10**

---

## Additional Findings

### File Naming Convention
- **100% kebab-case** across all 155 files -- excellent consistency
- No uppercase, no camelCase, no snake_case in filenames
- Component names are PascalCase (standard React convention)

### Service Architecture
The project implements a clean dual-API pattern:
1. **Server services** (`services/server/`): Use `"use server"` actions and direct Shopify GraphQL
2. **Client services** (`services/client/`): Use `apiFetch` (fetch wrapper) or `apiAxios` (Axios) to call NestJS backend

Additionally:
- **Config layer** (`config/`): `axios.ts` (client), `fetch.ts` (server/client), `shopify.ts` (server GraphQL)
- **Mapper layer** (`mappers/`): `product-mapper.ts` -- transforms Shopify responses to app types
- **Query layer** (`queries/shopify/`): 6 GraphQL queries/mutations as tagged template literals

### Auth Token Architecture
Notable security-conscious design:
- Shopify customer access tokens stored in **httpOnly cookies** (not localStorage)
- Server Action `getAuthToken()` reads cookie and passes as prop to `AuthProvider`
- Client never directly accesses the token cookie
- Axios interceptor for NestJS API uses `localStorage` token (separate from Shopify token) -- potential inconsistency

### Language Inconsistency
The codebase mixes English and Portuguese:
- JSDoc comments: mostly Portuguese ("Busca os dados do customer", "Gerencia streaming")
- Code comments: mix of both
- User-facing strings: mostly English, but several Portuguese strings in search modal, header toasts, and chat error messages
- This suggests a Brazilian development team with incomplete i18n

### Data Architecture
- Mock data files (`data/mock-*.ts`) exist alongside real Shopify integration -- suggests features at different maturity levels
- Product mapper has hardcoded fallback values (`rating: 4.5`, `reviewCount: 10`, `originalPrice: price + 10`) -- artificially inflating product data

---

## Scoring Summary

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| 1. `any` usage (3 total) | 9.5/10 | 8% | 0.76 |
| 2. TypeScript strict config | 8.5/10 | 5% | 0.43 |
| 3. File size discipline | 7.0/10 | 4% | 0.28 |
| 4. Component organization | 8.5/10 | 10% | 0.85 |
| 5. Custom hooks quality | 8.0/10 | 8% | 0.64 |
| 6. Context/state management | 8.0/10 | 8% | 0.64 |
| 7. React Query patterns | 6.5/10 | 5% | 0.33 |
| 8. Server/Client components | 8.5/10 | 10% | 0.85 |
| 9. Form validation (RHF+Zod) | 7.5/10 | 5% | 0.38 |
| 10. shadcn/ui consistency | 9.0/10 | 4% | 0.36 |
| 11. Tailwind CSS 4 tokens | 7.5/10 | 4% | 0.30 |
| 12. Carousel implementation | 7.0/10 | 3% | 0.21 |
| 13. Accessibility | 4.5/10 | 8% | 0.36 |
| 14. Responsive design | 8.0/10 | 5% | 0.40 |
| 15. SEO (e-commerce critical) | 3.0/10 | 8% | 0.24 |
| 16. Component patterns | 8.0/10 | 5% | 0.40 |
| 17. Error boundaries | 2.0/10 | 5% | 0.10 |
| 18. Toast feedback | 7.0/10 | 3% | 0.21 |

**Weighted Total: 6.74 / 10**

---

## Final Score: 7.0 / 10

### Justification

The Zenberry frontend demonstrates **remarkably strong fundamentals**: only 3 `any` types in 12K LOC (best in ecosystem), strict TypeScript, excellent Next.js 16 server/client component boundaries, and clean component architecture with the Data Fetcher pattern. The hook quality is high, contexts are well-designed, and shadcn/ui is used purely and consistently.

However, two critical gaps prevent a higher score:

1. **SEO is essentially absent** (3.0/10) -- for an e-commerce site, having zero per-page metadata, no structured data, no Open Graph tags, and no sitemap is a fundamental omission that would severely impact discoverability.

2. **Error boundaries do not exist** (2.0/10) -- no `error.tsx` files anywhere means any rendering error crashes the entire page with no recovery.

3. **Accessibility needs work** (4.5/10) -- basic keyboard support exists but no focus trapping, no ARIA roles on modals, no skip navigation, and no screen reader support for dynamic content.

### Ecosystem Ranking

| Project | Score | Key Differentiator |
|---------|-------|--------------------|
| Chorus | 7.5 | Services+hooks layered API |
| Vaultly | 7.4 | 3-client API pattern |
| Scafold | 7.2 | 100% kebab-case, RQ exemplar |
| **Zenberry** | **7.0** | **Best `any` count (3), excellent RSC patterns, but SEO/a11y gaps** |
| Chats | 6.4 | -- |
| Veris | 5.0 | -- |

Zenberry ranks 4th in the ecosystem. Its TypeScript discipline and Next.js 16 architecture are best-in-class, but the e-commerce-critical gaps in SEO and error handling hold it back from the top tier.

### Top 5 Recommendations (Priority Order)

1. **Add per-page metadata and JSON-LD structured data** -- especially `generateMetadata` on product detail pages. This is the highest-impact change for an e-commerce site.
2. **Add `error.tsx` at minimum at root and per-route level** -- Next.js error boundaries are trivial to add and prevent page-wide crashes.
3. **Add focus trapping, ARIA roles, and skip-to-content link** -- essential for WCAG compliance.
4. **Extract shared phone input logic** into a reusable component to eliminate the DRY violation between register and edit-profile forms.
5. **Decide on React Query usage**: either use it for client-side data fetching (replacing manual fetch in hooks) or remove the dependency to reduce bundle size.
