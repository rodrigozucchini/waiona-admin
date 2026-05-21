# Security — Waiona Admin

Applied security rules for the admin panel. Focus is on the attack surface specific to this stack: Server Actions, httpOnly cookies, API proxying, and user input.

---

## 1. Server Actions — Never Trust Client Input

Every Server Action is a public HTTP endpoint. Validate all inputs server-side, even if the form has client-side validation:

```typescript
// actions/products.ts
'use server'
import { z } from 'zod'

const CreateProductSchema = z.object({
  sku: z.string().min(1).max(100).regex(/^[A-Z0-9-]+$/, 'SKU solo puede contener letras mayúsculas, números y guiones'),
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().uuid('ID de categoría inválido'),
  measurementUnit: z.enum(['unit', 'kg', 'liter', 'gram', 'ml']),
  measurementValue: z.number().positive().max(99999),
})

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    sku: formData.get('sku'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    categoryId: formData.get('categoryId'),
    measurementUnit: formData.get('measurementUnit'),
    measurementValue: Number(formData.get('measurementValue')),
  }

  const result = CreateProductSchema.safeParse(raw)

  if (!result.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
    )
    return { status: 'error', message: 'Datos inválidos', fieldErrors }
  }

  // result.data is fully typed and validated — safe to send to API
  await api.post('/products', result.data)
  // ...
}
```

---

## 2. httpOnly Cookies — Token Storage

Never store tokens anywhere accessible to JavaScript:

```typescript
// lib/auth.ts — correct cookie configuration
cookieStore.set('access_token', token, {
  httpOnly: true,           // Not accessible via document.cookie
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',          // CSRF protection for same-origin navigation
  maxAge: 60 * 60,          // 1 hour in seconds
  path: '/',
})
```

- `httpOnly: true` — prevents XSS from stealing tokens
- `sameSite: 'lax'` — prevents CSRF on state-mutating GET requests; POST actions from third-party sites are blocked
- `secure: true` in production — prevents token transmission over plain HTTP

---

## 3. Content Security Policy

Add CSP headers to prevent XSS injection:

```typescript
// middleware.ts — add CSP to all responses
import { NextRequest, NextResponse } from 'next/server'

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",   // 'unsafe-inline' needed for Next.js inline scripts
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://res.cloudinary.com data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",              // Prevents clickjacking
].join('; ')

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // ... rest of auth logic
  return response
}
```

---

## 4. Route Handler — Validate the Token Exists

Route Handlers act as the API proxy. Always verify the session before proxying:

```typescript
// app/api/products/route.ts
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  // Reject unauthenticated requests — don't let them reach the API
  if (!token) {
    return Response.json({ message: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = await api.post('/products', body, { token })
    return Response.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ message: err.message }, { status: err.status })
    }
    return Response.json({ message: 'Error interno' }, { status: 500 })
  }
}
```

---

## 5. Input Sanitization — Prevent XSS in Stored Data

When rendering user-generated content (product descriptions, notes), never use `dangerouslySetInnerHTML`:

```typescript
// ✗ Never — XSS if content contains <script>
<div dangerouslySetInnerHTML={{ __html: product.description }} />

// ✓ React escapes automatically
<p>{product.description}</p>

// ✓ If you need rich text rendering, use a sanitized renderer
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(product.description)
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

For the admin panel, product descriptions and notes are plain text — never render them as HTML unless you've explicitly configured a rich text editor.

---

## 6. Destructive Operations — Double Verification

For irreversible operations (delete product, stock write-off), require explicit confirmation:

```typescript
// In Server Actions — verify the resource belongs to the expected context
export async function deleteProduct(id: string): Promise<ActionState> {
  // First verify the resource exists (prevents timing attacks on IDs)
  try {
    await api.get<Product>(`/products/${id}`)
  } catch (err) {
    if (isApiError(err) && err.status === 404) {
      return { status: 'error', message: 'Producto no encontrado' }
    }
  }

  try {
    await api.delete(`/products/${id}`)
  } catch (err) {
    if (isApiError(err)) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar' }
  }

  revalidateTag('products')
  redirect('/catalog/products')
}
```

---

## 7. File Upload — Validate Before Proxying

Before forwarding an uploaded file to the API, validate type and size:

```typescript
// app/api/product-images/upload/route.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ message: 'Archivo requerido' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { message: 'Solo se permiten imágenes JPEG, PNG o WebP' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { message: 'El archivo no puede superar 5MB' },
      { status: 400 }
    )
  }

  // Safe to proxy to the API
  // ...
}
```

---

## 8. Environment Variables — Never Leak Secrets

```typescript
// ✗ Exposed to the browser
const url = process.env.NEXT_PUBLIC_API_URL

// ✓ Server-only — Next.js errors at build time if used in a Client Component
const url = process.env.API_URL
```

Required server-only vars:
```bash
API_URL=http://localhost:3000/api/v1
JWT_SECRET=<same secret as waiona-core>
```

These must never have a `NEXT_PUBLIC_` prefix.

---

## 9. Error Responses — Don't Leak Stack Traces

```typescript
// ✗ Leaks internal details
return Response.json({ message: err.stack }, { status: 500 })

// ✓ Generic message to the client, log internally
console.error('[API Error]', err)
return Response.json({ message: 'Error interno del servidor' }, { status: 500 })
```

Only return structured error details for known `ApiError` instances (which come from waiona-core's standardized format).

---

## 10. Security Checklist

- [ ] All Server Actions validate inputs with Zod before calling the API
- [ ] Tokens stored in `httpOnly`, `secure`, `sameSite=lax` cookies only
- [ ] CSP header blocks inline scripts from unknown origins
- [ ] `X-Frame-Options: DENY` prevents clickjacking
- [ ] No `NEXT_PUBLIC_` prefix on API_URL or JWT_SECRET
- [ ] File uploads validate type and size before proxying
- [ ] No `dangerouslySetInnerHTML` on user-generated content
- [ ] Route Handlers check for auth token before proxying
- [ ] Destructive actions (delete, write-off) have a confirmation step in the UI
- [ ] Error responses to clients never include stack traces or internal paths
