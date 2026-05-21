# API Client — Waiona Core Integration

Rules for consuming the **waiona-core** REST API (`http://localhost:3000/api/v1`).
All API access is server-side only. Client Components never call waiona-core directly.

---

## 1. The Two-Layer Pattern

Every API call goes through two layers:

```
Server Component / Server Action
    → lib/api.ts (server-side fetch wrapper)
    → waiona-core (external API on port 3000)

Client Component
    → fetch('/api/<resource>') (internal Route Handler)
    → app/api/<resource>/route.ts
    → lib/api.ts
    → waiona-core
```

Never skip layers. Never call `http://localhost:3000` from a Client Component.

---

## 2. lib/api.ts — The API Client

```typescript
// lib/api.ts
import { cookies } from 'next/headers'

const BASE = process.env.API_URL // 'http://localhost:3000/api/v1'

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  token?: string
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, token, ...init } = options

  const cookieStore = await cookies()
  const sessionToken = token ?? cookieStore.get('access_token')?.value

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      ...init.headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(res.status, error.message, error.error)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string | string[],
    public error?: string
  ) {
    super(Array.isArray(message) ? message.join(', ') : message)
    this.name = 'ApiError'
  }
}

// Convenience methods
export const api = {
  get: <T>(path: string, init?: ApiOptions) =>
    apiRequest<T>(path, { method: 'GET', ...init }),
  post: <T>(path: string, body: unknown, init?: ApiOptions) =>
    apiRequest<T>(path, { method: 'POST', body, ...init }),
  patch: <T>(path: string, body: unknown, init?: ApiOptions) =>
    apiRequest<T>(path, { method: 'PATCH', body, ...init }),
  delete: <T>(path: string, init?: ApiOptions) =>
    apiRequest<T>(path, { method: 'DELETE', ...init }),
}
```

---

## 3. Paginated Requests

The API uses page/limit pagination. Always type the response:

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

// Usage in Server Component
const result = await api.get<PaginatedResponse<Product>>(
  `/products?page=${page}&limit=${limit}`
)
```

Pass pagination from URL searchParams — never from state:

```typescript
// app/(admin)/products/page.tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const { page = '1', limit = '20' } = await searchParams
  const products = await api.get<PaginatedResponse<Product>>(
    `/products?page=${page}&limit=${limit}`
  )
  // ...
}
```

---

## 4. Route Handlers (BFF Proxy)

Every resource that a Client Component needs must have a Route Handler:

```typescript
// app/api/products/route.ts
import { api } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = searchParams.get('page') ?? '1'
  const limit = searchParams.get('limit') ?? '20'

  const data = await api.get(`/products?page=${page}&limit=${limit}`)
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const data = await api.post('/products', body)
  return Response.json(data, { status: 201 })
}
```

For dynamic routes:

```typescript
// app/api/products/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const data = await api.patch(`/products/${id}`, body)
  return Response.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await api.delete(`/products/${id}`)
  return new Response(null, { status: 204 })
}
```

---

## 5. Error Handling in Route Handlers

Always propagate API errors with the correct status:

```typescript
import { ApiError } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await api.post('/products', body)
    return Response.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json(
        { message: err.message, error: err.error },
        { status: err.status }
      )
    }
    return Response.json({ message: 'Internal error' }, { status: 500 })
  }
}
```

---

## 6. API Endpoints Quick Reference

| Resource | Base Path | Auth |
|----------|-----------|------|
| Auth | `/auth` | Public (rate-limited) |
| Users | `/users` | JWT + ADMIN |
| Products | `/products` | JWT + ADMIN |
| Product Images | `/product-images` | JWT + ADMIN |
| Categories | `/categories` | JWT + ADMIN |
| Combos | `/combos` | JWT + ADMIN |
| Combo Images | `/combo-images` | JWT + ADMIN |
| Stock Items | `/stock-items` | JWT + ADMIN |
| Stock Locations | `/stock-locations` | JWT + ADMIN |
| Stock Movements | `/stock-movements` | JWT + ADMIN |
| Stock Write-offs | `/stock-write-offs` | JWT + ADMIN |
| Tax Types | `/tax-types` | JWT + ADMIN |
| Taxes | `/tax-types/:id/taxes` | JWT + ADMIN |
| Margins | `/margins` | JWT + ADMIN |
| Product Pricing | `/product-pricing` | JWT + ADMIN |
| Combo Pricing | `/combo-pricing` | JWT + ADMIN |
| Coupons | `/coupons` | JWT + ADMIN |
| Discounts | `/discounts` | JWT + ADMIN |
| Orders | `/orders` | JWT |
| Payments | `/payments` | JWT |
| Analytics | `/analytics` | JWT + ADMIN |

---

## 7. Environment Variables

```bash
# .env.local
API_URL=http://localhost:3000/api/v1
JWT_SECRET=<same as waiona-core JWT_SECRET>
```

Never use `NEXT_PUBLIC_` for these — they must stay server-side.
