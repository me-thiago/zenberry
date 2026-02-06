# Agent 8 -- Scalability & Performance Analysis: Zenberry Frontend

**Project:** Zenberry -- CBD/THC E-commerce with AI Chatbot
**Scope:** `/Users/thiagon/Documents/me-thiago/zenberry/zenberry-front/`
**Stack:** Next.js 16.0.7 + React 19.2.0, Tailwind CSS 4, shadcn/ui, React Query 5, embla-carousel, react-markdown
**Codebase:** ~12,337 LOC across 155 files
**Date:** 2026-02-04

---

## Executive Summary

| Category | Score | Details |
|----------|-------|---------|
| Bundle Analysis | 6/10 | GraphQL runtime + react-markdown + axios are heavy; but React Compiler enabled |
| Dynamic Imports | 1/10 | **ZERO** dynamic imports -- `next/dynamic` and `React.lazy` completely absent |
| Loading/Error States | 5/10 | App-level `loading.tsx` present, 2 Suspense boundaries, but zero `error.tsx` files and zero per-route `loading.tsx` |
| SSR vs Client Components | 4/10 | 53 of 155 files (34%) are `"use client"` -- too many; server components underutilized |
| next/image Usage | 8/10 | Excellent -- 21 files use `next/image`, product images served through it |
| next/font Usage | 9/10 | Geist + Geist_Mono from `next/font/google` -- properly configured in layout |
| React Query Config | 9/10 | staleTime 5m, gcTime 10m, smart retry logic, refetchOnWindowFocus disabled |
| Chat localStorage | 5/10 | Persistence works, but **NO size limits or cleanup mechanism** |
| Product Catalog | 5/10 | Client-side filtering is good, but **NO pagination** -- loads all 30 products at once |
| SEO / SSG / ISR | 7/10 | ISR with `revalidate: 60` on products, but no `generateStaticParams`, no per-page metadata |
| Shopify Sync | 7/10 | `force-cache` default with revalidate overrides, proper caching strategy |
| next.config Optimization | 5/10 | React Compiler enabled, but **NO `optimizePackageImports`** |
| Core Web Vitals | 4/10 | Critical LCP risk from 3.9MB background image + unoptimized CSS backgrounds |
| Virtualization | 1/10 | **ZERO** virtualization anywhere -- not on product lists, not on chat messages |
| Responsive Images | 4/10 | next/image used but `sizes` attribute never specified, `priority` overused |
| GraphQL Dependency | 8/10 | Actively used -- Shopify Storefront API via graphql-tag, not dead weight |

**Overall Score: 5.5/10**

---

## 1. Bundle Analysis -- Heavy Dependencies

### Dependencies Breakdown (package.json)

| Package | Size Impact | Verdict |
|---------|-------------|---------|
| `graphql` + `graphql-tag` + `@graphql-typed-document-node/core` | ~180KB combined | **USED** -- Shopify Storefront API integration |
| `react-markdown` + `remark-gfm` | ~100KB combined | **USED** -- chat message rendering, but loaded eagerly |
| `embla-carousel-react` | ~35KB | **USED** -- 4 carousels (product, category, featured, benefits) |
| `axios` | ~30KB | **REDUNDANT** -- only used in `chat-api.ts`, could use native fetch |
| `zod` (v4.1.12) | ~15KB | **USED** -- login/register schema validation |
| `lucide-react` (v0.548) | **Variable** -- tree-shakes per icon | OK if tree-shaking works |
| `sonner` | ~10KB | **USED** -- toast notifications |
| `react-hook-form` + `@hookform/resolvers` | ~25KB | **USED** -- auth forms |

**Positive:** React Compiler is enabled (`reactCompiler: true` in next.config.ts, `babel-plugin-react-compiler` 1.0.0 in devDependencies). This is a significant performance win for auto-memoization.

**Critical issue:** `axios` is redundant dead weight. The project already has a custom `fetchApi` wrapper in `src/config/fetch.ts` used for server-side calls. Axios is only used in `src/config/axios.ts` for the chat service. This adds ~30KB to the client bundle for no reason.

**Missing from next.config.ts:**
```ts
// NOT present:
optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion', ...]
```

### Score: 6/10

---

## 2. Dynamic Imports -- CRITICAL GAP

**Result: ZERO dynamic imports found.**

Searched for:
- `next/dynamic` -- 0 occurrences
- `React.lazy` -- 0 occurrences

### Components That MUST Be Dynamically Imported

| Component | Why | Est. Bundle Save |
|-----------|-----|-----------------|
| `ChatbotModal` | Loaded on every page via BaseLayout, but only opened on click | ~150KB (react-markdown + remark-gfm + chat hooks) |
| `CartDrawer` | Loaded on every page, only shown when cart is opened | ~20KB |
| `SearchModal` | Loaded in header, only shown on search click | ~15KB |
| `NotificationsDrawer` | Loaded in header, only shown on bell click | ~10KB |
| `ReactQueryDevtools` | Should be dev-only, currently ships to production | ~50KB |

**The chatbot is the worst offender.** It includes `react-markdown`, `remark-gfm`, the full chat interface, and two chat hooks (useChat + useChatStream). All of this is bundled into EVERY page load because `BaseLayout` always renders `<ChatbotModal />`.

```tsx
// src/components/layout/base-layout.tsx -- line 76
<ChatbotModal />  // Always rendered, never lazy-loaded
```

### Score: 1/10 -- WORST possible score. This is a critical performance regression.

---

## 3. Loading.tsx and Error.tsx

### loading.tsx Files Found: 1

| Path | Level |
|------|-------|
| `src/app/loading.tsx` | Root/app-level |

**Missing per-route loading.tsx files:**
- `src/app/products/loading.tsx` -- **MISSING** (partially compensated by Suspense boundary)
- `src/app/products/[handle]/loading.tsx` -- **MISSING** (partially compensated by Suspense boundary)
- `src/app/about/loading.tsx` -- **MISSING**
- `src/app/auth/loading.tsx` -- **MISSING**
- `src/app/favorites/loading.tsx` -- **MISSING**
- `src/app/orders/loading.tsx` -- **MISSING**
- `src/app/profile/loading.tsx` -- **MISSING**
- `src/app/benefits/loading.tsx` -- **MISSING**

### error.tsx Files Found: 0

**ZERO error.tsx files anywhere in the project.** This means:
- Any server-side error crashes the entire page
- No graceful error recovery per route segment
- No ability to retry failed operations

### Score: 5/10 -- The root loading.tsx exists with a custom ZenberryLoader, but zero error boundaries and zero per-route loading states.

---

## 4. Suspense Boundaries

### Suspense Usage: 2 boundaries

| Location | Fallback | Purpose |
|----------|----------|---------|
| `src/app/products/page.tsx:25` | `<ProductsLoader />` | Wraps `ProductsDataFetcher` (server component fetching from Shopify) |
| `src/app/products/[handle]/page.tsx:25` | `<ProductsLoader loadingMessage="Loading product..." />` | Wraps `ProductByIdDataFetcher` |

**Missing Suspense boundaries for:**
- Home page (`src/app/page.tsx`) -- renders `ProductsSuggestion` (server component) without Suspense
- `QuestionsFormWrapper` -- server component fetching 50 products, no Suspense
- `FeaturedCbdThc` -- server component fetching collection, no Suspense
- `ProductsSuggestion` in product detail page -- server fetch without Suspense wrapping

The home page is especially concerning because it makes **4 separate Shopify API calls** (via `ProductsSuggestion` x2, `QuestionsFormWrapper`, `FeaturedCbdThc`) and none are wrapped in Suspense, meaning the entire page blocks until ALL fetches complete.

### Score: 5/10

---

## 5. SSR vs Client Components -- Next.js 16 Features

### Client Component Analysis

**53 out of 155 files (34%) are marked `"use client"`**

This is a high ratio. Key client component categories:

| Category | Count | Notes |
|----------|-------|-------|
| UI Components (shadcn/ui) | 7 | accordion, badge (no), button (no), checkbox, label, separator, tabs |
| App pages | 4 | favorites, orders, benefits, profile/header |
| Product components | 7 | content, filter, carousel, product-card-grid, gallery, etc. |
| Chatbot | 5 | modal, interface, message, suggestions, clear-confirmation |
| Layout/Header | 4 | base-layout, header, footer, hero |
| Contexts | 3 | auth, cart, chatbot |
| Hooks | 5 | chat, chat-stream, favorites, search-products, etc. |
| Providers | 2 | query, toast |

### Server Components (Good Use)

These server components correctly fetch data on the server:
- `ProductsDataFetcher` -- fetches products from Shopify
- `ProductByIdDataFetcher` -- fetches single product
- `ProductsSuggestion` -- fetches collection
- `QuestionsFormWrapper` -- fetches products for form
- `FeaturedCbdThc` -- fetches featured collection

**Problem:** `BaseLayout` is `"use client"` but it renders on every page. This forces the entire layout shell (header, footer, chat, cart) to be client-rendered, negating potential SSR benefits.

### Next.js 16 Features Used

| Feature | Used? |
|---------|-------|
| React Compiler | YES (reactCompiler: true) |
| Server Components | YES (data fetchers) |
| Server Actions | YES (cart-service.ts uses `'use server'`) |
| Streaming with Suspense | PARTIAL (2 boundaries) |
| Parallel Routes | NO |
| Intercepting Routes | NO |
| Route Groups | NO |
| generateStaticParams | NO |
| generateMetadata (per-page) | NO |

### Score: 4/10

---

## 6. next/image Usage -- CRITICAL for E-commerce

### Usage: 21 files import `next/image`

**Product images correctly use next/image:**
- `product-card-grid.tsx` -- `<Image src={imageUrl} fill className="..." />`
- `product-card-list.tsx` -- `<Image src={imageUrl} fill className="..." />`
- `product-by-id-image-gallery.tsx` -- `<Image fill priority />` for main, `<Image width={100} height={35} priority />` for thumbnails
- `featured-product-carousel.tsx` -- `<Image fill />`
- `cart-item.tsx` -- `<Image />`
- `search-product-card.tsx` -- `<Image />`

**Remote patterns configured correctly:**
```ts
// next.config.ts
images: {
  remotePatterns: [
    { hostname: 'cdn.shopify.com' },  // Shopify CDN
    { hostname: 'placehold.co' },      // Placeholder
  ],
}
```

### Issues Found

1. **No `sizes` attribute anywhere.** When using `fill`, the `sizes` attribute is critical for responsive image optimization. Without it, Next.js sends the full-width image variant, wasting bandwidth.

2. **`priority` overused on product detail page.** Both the main image AND all 4 thumbnails have `priority={true}`. Only the main LCP image should have priority; thumbnails should lazy-load.

3. **Background images bypass next/image entirely.** The `BaseLayout` component uses CSS `backgroundImage` with `url()` for page backgrounds:
   - `zenberry-product-background.webp` (3.9 MB!) -- home page hero
   - `zenberry-product-background-small.webp` (1.6 MB) -- product pages
   - `hero-cta-background.webp` (1.0 MB) -- CTA section
   - `florest-background.webp` (658 KB) -- about/auth pages

   These bypass ALL Next.js image optimization (no WebP conversion, no responsive sizes, no lazy loading).

4. **Category carousel uses CSS backgroundImage for ice-breaker PNGs** (1.1-1.7 MB EACH, 9 images totaling ~12 MB). These are PNG, not even WebP, and loaded via CSS `backgroundImage` in `category-carousel.tsx`:
   ```tsx
   backgroundImage: `url('${category.image}')`
   ```

### Score: 8/10 for product image handling (good), but overall image strategy has critical gaps.

---

## 7. next/font Usage

```tsx
// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

Properly configured with CSS variables, applied via className in body. No external font loading, no FOUT risk.

### Score: 9/10

---

## 8. React Query Configuration

```tsx
// src/providers/query-provider.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 10,        // 10 minutes (v5 gcTime)
      retry: (failureCount, error) => {
        if (isClientError(error)) return false;  // No retry on 4xx
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
})
```

**Excellent configuration:**
- Smart staleTime (5 min) prevents unnecessary refetches
- gcTime (10 min) keeps cache warm
- Intelligent retry logic (skip 4xx, retry 3x for server errors)
- refetchOnWindowFocus disabled (good for e-commerce -- no cart flickering)
- refetchOnReconnect enabled (resilience)

**Issue:** `ReactQueryDevtools` is always imported, even in production:
```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// ...
<ReactQueryDevtools initialIsOpen={false} />
```
This should be conditionally imported or dynamically loaded.

**Missing:** No query prefetching for products. The `useSearchProducts` hook has its own in-memory cache (module-level `cachedProducts` variable with 5-min TTL), which is a reasonable approach but doesn't leverage React Query.

### Score: 9/10

---

## 9. Chat localStorage Persistence -- Size Limits & Cleanup

### Implementation Analysis

**Two separate chat hooks persist to localStorage:**

1. `useChat` (src/hooks/use-chat.ts):
   - Key: `zenberry_chat_history`
   - Persists ALL messages with no size limit
   - No cleanup mechanism
   - No max message count

2. `useChatStream` (src/hooks/use-chat-stream.ts):
   - Key: `zenberry_chat_stream_history`
   - Same issues -- unbounded storage

**Critical Problems:**

1. **No message limit.** If a user has 1000+ messages, the entire history is serialized/deserialized on every page load (both hooks initialize from localStorage in useState initializer).

2. **No size limit.** Each message can be up to 2000 characters. With AI responses potentially being long (markdown with code blocks), localStorage could easily hit the 5-10MB browser limit.

3. **No cleanup on logout.** The `clearChat` function exists but is only called manually via the "New Chat" button. There's no automatic cleanup on user logout.

4. **Both hooks initialize simultaneously.** The `ChatInterface` component instantiates BOTH `useChat()` AND `useChatStream()`:
   ```tsx
   const chatHook = useChat({ persistHistory: true });
   const streamHook = useChatStream({ persistHistory: true });
   ```
   This means both localStorage keys are read and parsed on every chatbot open, even though only one is used (currently `useStreaming={false}`).

5. **Cart localStorage** (`zenberry-cart`) and **favorites localStorage** (`zenberry-favorites-{userId}`) also have no size limits, though these are unlikely to grow unbounded.

### Score: 5/10

---

## 10. Product Catalog -- Pagination, Filtering, Search

### Pagination: ABSENT

The products page fetches ALL products in one request:
```tsx
// src/app/products/_components/products-data-fetcher.tsx
const { products: shopifyProducts } = await shopifyQuery(
  GET_PRODUCTS_QUERY, { first: 30 }  // Fixed at 30, no pagination
);
```

No `cursor`-based pagination, no page parameter handling, no "Load More" button. If the catalog grows beyond 30 products, users cannot see them.

### Filtering: Client-Side Only

Filtering is implemented entirely client-side via URL search params:
```tsx
// src/app/products/_components/products-content.tsx
const filteredProducts = useMemo(() => {
  return products.filter((product) => { ... });
}, [products, types, categories, formats, users]);
```

This is **acceptable for <100 products** but will not scale. Filters available:
- CBD Type (Full Spectrum, Broad Spectrum, etc.)
- Category (Daily Balance, Relaxation, etc.)
- Format (Tincture, Gummies, etc.)
- User target (Myself/Loved Ones, Pets)

### Search: Client-Side with Full Product Preload

The search modal (`SearchModal`) loads ALL products (up to 250) when opened:
```tsx
// src/hooks/use-search-products.ts
const response = await fetch(`/api/products/search?limit=250`);
```

Then filters client-side with simple `includes()` on name and description. Has in-memory cache with 5-min TTL (module-level variable).

**Sorting** is implemented via URL params but actual sort logic is NOT visible -- the `sortBy` param is set but never applied to filter/sort the products array.

### Score: 5/10

---

## 11. SEO -- SSG/ISR for Product Pages

### ISR Configuration

```tsx
// src/app/products/page.tsx
export const revalidate = 60;  // ISR every 60 seconds
```

Product data fetchers use `{ next: { revalidate: 60 } }` for Shopify queries. This means:
- Product list page revalidates every 60 seconds
- Individual product pages revalidate every 60 seconds
- Collection/suggestion components revalidate every 60 seconds

### Missing: generateStaticParams

**No `generateStaticParams` found anywhere.** This means product pages (`/products/[handle]`) are NOT pre-rendered at build time. For an e-commerce site, this is a significant SEO miss -- Google's crawler will see ISR-delayed pages instead of pre-built HTML.

### Missing: Per-Page Metadata

Only root-level metadata exists:
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "Zenberry",
  description: "CBD and THC products e-commerce platform",
};
```

**No `generateMetadata` on product pages.** Product detail pages should have:
- Dynamic title: "Product Name | Zenberry"
- Dynamic description from product description
- Open Graph images from product images
- Structured data (JSON-LD) for rich snippets

### Score: 7/10 -- ISR is configured correctly, but missing SSG pre-generation and per-page metadata.

---

## 12. Shopify Product Sync -- Caching Strategy

### Caching Layers

1. **Shopify Query Default:** `force-cache` (full cache until revalidation)
2. **Product fetches:** `{ next: { revalidate: 60 } }` (ISR 60s)
3. **Search API route:** `"no-store"` (no caching for search results)
4. **Cart checkout:** `"no-store"` (always fresh for cart operations)
5. **Client-side search cache:** In-memory, 5-minute TTL

### Potential Stale Data Issues

- Products cache for 60 seconds. If a product goes out of stock on Shopify, users could see stale availability for up to 60 seconds.
- The `availableForSale` field IS fetched but only checked at variant level.
- Price changes have the same 60-second window.

**The caching strategy is reasonable** for a CBD e-commerce site that likely has <100 products with infrequent changes.

### Score: 7/10

---

## 13. optimizePackageImports in next.config

```tsx
// next.config.ts -- CURRENT
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { remotePatterns: [...] },
};
```

**Missing:**
```tsx
// SHOULD HAVE:
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-accordion',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-label',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-separator',
    '@radix-ui/react-tabs',
  ],
}
```

`lucide-react` v0.548 imports are used extensively (40+ icons across the app). Without `optimizePackageImports`, the bundler may include more of the icon library than needed.

### Score: 5/10

---

## 14. Core Web Vitals Concerns

### LCP (Largest Contentful Paint) -- HIGH RISK

**Home Page LCP Killers:**
1. `zenberry-product-background.webp` (3.9 MB!) loaded via CSS `backgroundImage` -- this bypasses all Next.js optimization
2. No `<Image priority>` on the home page hero (there IS no hero image via next/image)
3. Category carousel loads 9 PNG images (1.1-1.7 MB each) via CSS `backgroundImage`

**Product Page LCP:**
- Product image gallery main image has `priority={true}` -- correct
- But background image `zenberry-product-background-small.webp` (1.6 MB) loads via CSS

### FID / INP (First Input Delay / Interaction to Next Paint)

- **ChatbotModal always rendered** on every page, adding JS overhead
- **Both chat hooks (useChat + useChatStream) initialize** when chatbot opens, reading localStorage
- Cart context reads localStorage on mount
- Auth context makes API call on mount (refreshCustomer)
- All of this happens on initial page load

### CLS (Cumulative Layout Shift)

- Product images use `fill` with aspect-ratio containers -- **good, no CLS**
- Background images use fixed CSS heights -- **good, no CLS**
- No explicit `sizes` on images could cause some issues
- Loading states (ZenberryLoader) render full-screen, preventing shift

### Specific Image Size Audit

| Image | Size | Used Via | Optimized? |
|-------|------|----------|-----------|
| zenberry-product-background.webp | **3.9 MB** | CSS backgroundImage | NO |
| zenberry-product-background-small.webp | **1.6 MB** | CSS backgroundImage | NO |
| hero-cta-background.webp | **1.0 MB** | CSS backgroundImage | NO |
| carousel-2.webp | **1.1 MB** | Unknown/unused? | NO |
| florest-background.webp | 658 KB | CSS backgroundImage | NO |
| info-card-2.webp | 600 KB | Unknown/next/image | Partial |
| Beauty-Skincare.png | **1.6 MB** | CSS backgroundImage | NO |
| Pet Care.png | **1.7 MB** | CSS backgroundImage | NO |
| Relaxation.png | **1.7 MB** | CSS backgroundImage | NO |
| Deep Sleep.png | **1.4 MB** | CSS backgroundImage | NO |
| Pain-Recovery.png | **1.4 MB** | CSS backgroundImage | NO |
| Science.png | **1.4 MB** | CSS backgroundImage | NO |
| Daily Balance.png | **1.1 MB** | CSS backgroundImage | NO |
| Daily Welness.png | **1.1 MB** | CSS backgroundImage | NO |

**Total unoptimized image weight on home page: ~20+ MB** (background + category carousel images).

### Score: 4/10 -- Critical LCP problems from unoptimized background images.

---

## 15. Virtualization on Long Lists

**Result: ZERO virtualization found.**

No usage of:
- `react-window`
- `react-virtuoso`
- `react-virtual` / `@tanstack/react-virtual`
- `IntersectionObserver`
- Any custom virtualization

### Where Virtualization Is Needed

| Component | Max Items | Concern |
|-----------|-----------|---------|
| Product grid (products-list.tsx) | 30 now, could grow | Moderate -- renders all products with images |
| Chat messages (chat-interface.tsx) | Unbounded | **HIGH** -- with persistent history, could have 100s of messages each containing ReactMarkdown rendering |
| Search results (search-modal.tsx) | Up to 250 | **HIGH** -- horizontal scroll with product cards + images |
| Favorites list (favorites/page.tsx) | Unbounded | Moderate |
| Cart items (cart-drawer.tsx) | Usually small | Low |

**The chat message list is the most concerning.** Each `ChatMessage` component renders `ReactMarkdown` with `remarkGfm` for assistant messages. With no virtualization and no message limit, scrolling through 100+ messages will cause significant jank.

### Score: 1/10

---

## 16. Responsive Images and Lazy Loading

### next/image `fill` Usage

Most product images correctly use `fill` layout:
```tsx
<Image src={imageUrl} alt={product.name} fill className="object-contain" />
```

But **no `sizes` prop is ever specified**, meaning the browser receives the default full-viewport-width image. For a product card grid that's typically 25-33% of viewport width, this wastes 3-4x bandwidth.

### `priority` Prop Usage -- 10 instances

| File | Component | Appropriate? |
|------|-----------|-------------|
| header.tsx (x2) | Logo images | YES -- above fold, small |
| auth-card.tsx | Auth background | YES |
| register-card.tsx | Register background | YES |
| benefit-hero-card.tsx | Benefit hero | YES |
| chatbot-modal.tsx | Chat logo | MAYBE -- only if chat is open |
| product-by-id-image-gallery.tsx (x2) | Main image + ALL thumbnails | **NO** -- only main image needs priority |
| product-by-id-comparison.tsx (x2) | Comparison images | **NO** -- below fold |

### `placeholder="blur"` Usage: ZERO

No images use blur placeholder, which would improve perceived performance during loading.

### Lazy Loading

Next.js `<Image>` lazy loads by default (unless `priority` is set). This is working correctly for product cards in carousels and grids.

**However,** CSS `backgroundImage` images (the biggest files) have NO lazy loading at all.

### Score: 4/10

---

## 17. GraphQL Dependency Analysis

### Is GraphQL Dead Weight? NO.

GraphQL is actively used for all Shopify Storefront API communication:

| Query File | Purpose | Usage |
|------------|---------|-------|
| `get-products-query.ts` | List products with metafields | Products page, QuestionsForm |
| `get-product-by-handle-query.ts` | Single product with images/variants | Product detail page |
| `get-collection-by-handle-query.ts` | Collection products | Home page suggestions, featured |
| `search-products-query.ts` | Product search | Search API route |
| `create-cart-mutation.ts` | Create Shopify cart | Checkout flow |
| `add-to-cart-mutation.ts` | Add items to cart | Cart operations |

Dependencies used:
- `graphql` -- runtime for query parsing
- `graphql-tag` -- `gql` template literal for queries
- `@graphql-typed-document-node/core` -- TypeScript types
- `print` from `graphql` -- converts AST to string for fetch

**However:** The `graphql` runtime is heavy (~100KB). Consider using a lighter alternative like compile-time query extraction or `graphql-request` which doesn't need the full runtime.

### Score: 8/10 -- Actively used, but the full `graphql` runtime is heavier than necessary.

---

## Ecosystem Comparison

| Project | Score | Key Differentiator |
|---------|-------|-------------------|
| **Zenberry** | **5.5/10** | ISR present, next/image excellent, React Compiler enabled, but ZERO dynamic imports, ZERO virtualization, massive unoptimized background images |
| Vaultly | 5.8/10 | IntersectionObserver, React Query 8/10 |
| Scafold | 5.5/10 | loading.tsx present!, 4 dynamic imports, React Query 8/10 |
| Veris | 4.8/10 | Baseline |
| Chats | 4.5/10 | Below baseline |
| Chorus | 4.2/10 | WORST -- zero dynamic imports, zero loading.tsx |

**Zenberry ties with Scafold at 5.5/10.** It has better ISR, React Compiler, and next/image usage than Scafold, but is worse on dynamic imports (0 vs 4) and has the critical background image problem that Scafold doesn't have.

---

## Top 10 Priority Fixes (Ordered by Impact)

### 1. CRITICAL -- Dynamic Import for ChatbotModal
**Impact: ~150KB bundle reduction on every page**
```tsx
// src/components/layout/base-layout.tsx
import dynamic from 'next/dynamic';
const ChatbotModal = dynamic(() => import('../chatbot/chatbot-modal').then(m => ({ default: m.ChatbotModal })), { ssr: false });
```

### 2. CRITICAL -- Optimize Background Images
**Impact: ~20MB total weight reduction**
- Replace CSS `backgroundImage` with `<Image>` component for hero/background images
- Convert all ice-breaker PNGs to WebP (would reduce ~12MB to ~2MB)
- Compress `zenberry-product-background.webp` (3.9MB is unacceptable)

### 3. HIGH -- Add `sizes` Prop to All Product Images
**Impact: 3-4x bandwidth reduction for product images**
```tsx
<Image src={imageUrl} alt={product.name} fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
```

### 4. HIGH -- Dynamic Import CartDrawer, SearchModal, NotificationsDrawer
**Impact: ~45KB bundle reduction on every page**

### 5. HIGH -- Add `generateStaticParams` for Product Pages
**Impact: SEO boost, faster TTFB for product pages**
```tsx
// src/app/products/[handle]/page.tsx
export async function generateStaticParams() {
  const products = await getProductHandles();
  return products.map((handle) => ({ handle }));
}
```

### 6. HIGH -- Add Per-Page `generateMetadata` for Products
**Impact: SEO -- product pages get proper titles, descriptions, OG images**

### 7. MEDIUM -- Add `error.tsx` for Key Routes
**Impact: Error resilience -- graceful recovery from Shopify API failures**

### 8. MEDIUM -- Add Chat Message Limit and localStorage Cleanup
**Impact: Prevents localStorage overflow and memory issues**

### 9. MEDIUM -- Add `optimizePackageImports` to next.config.ts
**Impact: Smaller bundles for lucide-react and Radix UI**

### 10. MEDIUM -- Remove Axios, Use Native Fetch for Chat
**Impact: ~30KB bundle reduction**

---

## Architecture Strengths

1. **React Compiler enabled** -- automatic memoization reduces re-renders without manual `useMemo`/`useCallback` (though the code also uses these extensively)
2. **Server Components for data fetching** -- product data fetchers are proper server components
3. **ISR with 60-second revalidation** -- good balance between freshness and performance
4. **Shopify GraphQL integration** -- typed queries with proper caching
5. **Cart cross-tab sync** -- StorageEvent listener keeps cart in sync
6. **Chat rate limiting** -- 10 messages/minute with 2-second cooldown
7. **next/image for product images** -- all product images use the optimized component
8. **Custom fetch wrapper** with Next.js cache integration

## Architecture Weaknesses

1. **BaseLayout is `"use client"`** -- forces entire layout shell client-side
2. **ChatbotModal renders on every page** without dynamic import
3. **No pagination** -- product catalog limited to `first: 30`
4. **Background images bypass optimization** -- 20+ MB of unoptimized assets
5. **No error boundaries** (error.tsx) anywhere
6. **Both chat hooks instantiate simultaneously** in ChatInterface
7. **Sorting is configured but not implemented** -- sortBy param is captured but never applied
8. **Redundant axios dependency** alongside custom fetch wrapper
