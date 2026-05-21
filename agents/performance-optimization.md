# Performance Optimization — Waiona Admin

Rules and patterns for keeping the admin panel fast: small bundles, smart caching, efficient rendering.

---

## 1. Bundle Size

The biggest bundle risk is accidentally importing client-side libraries in Server Components.

**Check regularly:**
```bash
ANALYZE=true npm run build
```

Install the analyzer:
```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // your config
})
```

**Target:** First Load JS under 200KB for the `(admin)` layout shell.

---

## 2. Server vs Client Boundary Discipline

Every `'use client'` is a bundle entry point. Keep them small:

```
app/(admin)/layout.tsx          → Server Component (no 'use client')
  └── SidebarClient.tsx         → 'use client' (toggle state only)
      └── NavLinks.tsx          → Server Component (just <Link> list)

app/(admin)/products/page.tsx   → Server Component (data fetching)
  └── ProductsTable.tsx         → Server Component (no interactivity)
      └── DeleteButton.tsx      → 'use client' (1 state, 1 handler)
```

Never put a `'use client'` component above a Server Component that fetches data.

---

## 3. Caching Strategy

| Data Type | Strategy | Cache Tag | TTL |
|-----------|----------|-----------|-----|
| Dashboard analytics | `unstable_cache` | `analytics` | 60s |
| Category tree | `unstable_cache` | `categories` | revalidate on mutation |
| Stock locations | `unstable_cache` | `stock-locations` | revalidate on mutation |
| Tax types | `unstable_cache` | `tax-types` | revalidate on mutation |
| Product listings | `fetch` cache default | — | revalidate per tag |
| Order listings | no cache | — | always fresh |
| User listings | no cache | — | always fresh |

```typescript
// lib/cache.ts — cached data fetchers
import { unstable_cache } from 'next/cache'
import { api } from './api'
import type { PaginatedResponse, Category, StockLocation } from '@/types'

export const getCategoryTree = unstable_cache(
  () => api.get<Category[]>('/categories/tree'),
  ['category-tree'],
  { tags: ['categories'] }
)

export const getStockLocations = unstable_cache(
  () => api.get<PaginatedResponse<StockLocation>>('/stock-locations?limit=100'),
  ['stock-locations'],
  { tags: ['stock-locations'] }
)

export const getTaxTypes = unstable_cache(
  () => api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100'),
  ['tax-types'],
  { tags: ['tax-types'] }
)
```

---

## 4. Image Optimization

All Cloudinary images must go through `next/image`:

```typescript
// ✗ Never
<img src={product.imageUrl} />

// ✓ Always
import Image from 'next/image'
<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={400}
  className="object-cover"
/>
```

For unknown dimensions, use `fill` with a positioned container:

```typescript
<div className="relative h-48 w-full">
  <Image
    src={imageUrl}
    alt={alt}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 400px"
  />
</div>
```

Configure the domain in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
  ],
},
```

---

## 5. Loading States — Every Page

Every page that fetches data needs a `loading.tsx`. Without it, the whole route suspends during navigation.

```
app/(admin)/
├── products/
│   ├── page.tsx
│   └── loading.tsx        ← required
├── stock/items/
│   ├── page.tsx
│   └── loading.tsx        ← required
└── dashboard/
    ├── page.tsx
    └── loading.tsx        ← required
```

Loading skeletons should match the layout of the actual page to avoid layout shift.

---

## 6. Navigation — Link Not Anchor

```typescript
// ✗ Never — triggers full page reload
<a href="/catalog/products">Productos</a>

// ✓ Always — client-side transition with prefetching
import Link from 'next/link'
<Link href="/catalog/products">Productos</Link>
```

For programmatic navigation in Client Components:

```typescript
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/catalog/products')
```

---

## 7. Parallel Data Fetching

In Server Components, always fetch independent data in parallel:

```typescript
// ✗ Sequential — slow
const product = await api.get(`/products/${id}`)
const categories = await api.get('/categories/tree')
const images = await api.get(`/product-images/product/${id}`)

// ✓ Parallel — fast
const [product, categories, images] = await Promise.all([
  api.get(`/products/${id}`),
  api.get('/categories/tree'),
  api.get(`/product-images/product/${id}`),
])
```

---

## 8. Error Boundaries

Every route group section should have an `error.tsx`:

```typescript
// app/(admin)/catalog/error.tsx
'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-muted-foreground">Ocurrió un error al cargar los datos.</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

---

## 9. Rate Limit Handling

The waiona-core API has a global rate limit of 30 requests per 60 seconds. Handle 429 responses gracefully:

```typescript
// In lib/api.ts
if (res.status === 429) {
  const retryAfter = res.headers.get('Retry-After') ?? '60'
  throw new ApiError(429, `Demasiadas solicitudes. Intenta en ${retryAfter} segundos.`)
}
```

In the UI, display the 429 message instead of a generic error.

---

## 10. Production Checklist

Before deploying:

- [ ] `npm run build` completes without warnings
- [ ] First Load JS for `(admin)` layout < 200KB
- [ ] All Cloudinary URLs use `next/image`
- [ ] No `<a href>` for internal links
- [ ] All `loading.tsx` files exist for data-fetching pages
- [ ] All `error.tsx` files exist per route group
- [ ] `unstable_cache` applied to stable reference data
- [ ] `revalidateTag` called in all Server Actions
- [ ] No `process.env` secrets accessible in Client Components
- [ ] `httpOnly` cookies for auth tokens (not localStorage)
