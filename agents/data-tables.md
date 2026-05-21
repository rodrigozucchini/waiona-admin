# Data Tables — Server-Side Pagination & Filtering

All admin tables use **server-side pagination** driven by URL `searchParams`. The URL is the single source of truth for page, filters, and sort state.

---

## 1. Core Pattern

```
URL ?page=2&limit=20&search=foo
    → Server Component reads searchParams
    → Fetches from API with those params
    → Renders table + pagination controls
```

Never store page/filter state in `useState`. Changing a filter = pushing a new URL.

---

## 2. API Pagination Response

```typescript
// types/index.ts
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}
```

---

## 3. Server Component Page

```typescript
// app/(admin)/products/page.tsx
import { api } from '@/lib/api'
import { ProductsTable } from '@/components/tables/ProductsTable'
import { Pagination } from '@/components/tables/Pagination'
import { TableFilters } from '@/components/tables/TableFilters'
import type { PaginatedResponse, Product } from '@/types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>
}) {
  const { page = '1', limit = '20', search } = await searchParams

  const query = new URLSearchParams({ page, limit })
  if (search) query.set('search', search)

  const result = await api.get<PaginatedResponse<Product>>(
    `/products?${query}`
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <TableFilters />
      </div>
      <ProductsTable data={result.data} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  )
}
```

---

## 4. Pagination Component

```typescript
// components/tables/Pagination.tsx
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  page: number
  totalPages: number
  total: number
}

export function Pagination({ page, totalPages, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params}`)
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{total} registros</span>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => navigate(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
```

---

## 5. Filter/Search Component

```typescript
// components/tables/TableFilters.tsx
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function TableFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // reset to page 1 on new search
    startTransition(() => {
      router.push(`${pathname}?${params}`)
    })
  }

  return (
    <input
      defaultValue={searchParams.get('search') ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Buscar..."
      className={isPending ? 'opacity-50' : ''}
    />
  )
}
```

---

## 6. Table Component

Tables are **Server Components** when data is passed as props (no interactivity needed for display). Only add `'use client'` if the table itself needs client interactivity (inline editing, row selection).

```typescript
// components/tables/ProductsTable.tsx — Server Component (no 'use client')
import type { Product } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import Link from 'next/link'

export function ProductsTable({ data }: { data: Product[] }) {
  if (data.length === 0) {
    return <EmptyState message="No hay productos" />
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((product) => (
          <tr key={product.id}>
            <td>{product.sku}</td>
            <td>{product.name}</td>
            <td>{product.category?.name}</td>
            <td>
              <StatusBadge active={product.isActive} />
            </td>
            <td>
              <Link href={`/catalog/products/${product.id}`}>Editar</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 7. Loading Skeleton

Every paginated page needs a `loading.tsx` skeleton:

```typescript
// app/(admin)/products/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded bg-muted" />
      ))}
    </div>
  )
}
```

---

## 8. Empty State Component

```typescript
// components/shared/EmptyState.tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p>{message}</p>
    </div>
  )
}
```

---

## 9. Rules

- `page` and `limit` always come from `searchParams`, never `useState`
- Reset to `page=1` whenever a filter changes
- `limit` default is 20, max is 100 (enforced by the API)
- Tables are Server Components unless they need row-level interactivity
- Always provide a `loading.tsx` skeleton for pages with data fetching
- Always handle the empty state (zero results)
- Use `useTransition` to show pending state during navigation
