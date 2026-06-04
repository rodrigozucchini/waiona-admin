# Auth & Middleware — Waiona Admin

JWT-based authentication for the admin panel. Tokens stored in **httpOnly cookies** only.

---

## 1. Cookie Strategy

- `access_token` — httpOnly, secure, sameSite=lax, **maxAge: 15 min** (igual que `expiresIn` del JWT en el API)
- `refresh_token` — httpOnly, secure, sameSite=lax, **maxAge: 7 días**
- Never use `localStorage` or `sessionStorage` for tokens.
- Never expose tokens to Client Components.

---

## 2. proxy.ts (Next.js 16)

> **Next.js 16**: el archivo se llama `proxy.ts` y la función exportada es `proxy` (no `middleware`).

Corre en cada request. Intenta refresh silencioso si el access token expiró; redirige al login si el refresh también falla.

```typescript
// proxy.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth']

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.')
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (pathname === '/login' && accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isPublic) return NextResponse.next()

  // Token válido → continuar
  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next()
  }

  // Token expirado → intentar refresh
  // POST /auth/refresh recibe { refresh_token } en el body (no requiere Bearer token)
  if (refreshToken) {
    try {
      const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (res.ok) {
        const { access_token: newToken, refresh_token: newRefresh } = await res.json()
        const response = NextResponse.next()
        const secure = process.env.NODE_ENV === 'production'

        response.cookies.set('access_token', newToken, {
          httpOnly: true, secure, sameSite: 'lax', maxAge: 60 * 15, path: '/',
        })
        response.cookies.set('refresh_token', newRefresh, {
          httpOnly: true, secure, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
        })
        return response
      }
    } catch {
      // Error de red — caer al redirect
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
```

---

## 3. lib/auth.ts — Session Helpers

```typescript
// lib/auth.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  return { token }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function setTokenCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 min — igual que expiresIn del JWT
    path: '/',
  })
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearTokenCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}
```

---

## 4. Login Page & Server Action

```typescript
// app/(auth)/login/page.tsx — Server Component
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  )
}
```

```typescript
// components/forms/LoginForm.tsx — Client Component
'use client'
import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state?.error && <p role="alert">{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
```

```typescript
// actions/auth.ts
'use server'
import { redirect } from 'next/navigation'
import { setTokenCookies, clearTokenCookies } from '@/lib/auth'

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    return { error: err.message ?? 'Credenciales inválidas' }
  }

  const { access_token, refresh_token } = await res.json()
  await setTokenCookies(access_token, refresh_token)
  redirect('/dashboard')
}

// POST /auth/logout — el refresh token ES la credencial.
// El API no tiene AuthGuard('jwt') aquí porque el access token puede haber expirado.
export async function logoutAction() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {})
  }

  await clearTokenCookies()
  redirect('/login')
}

// POST /auth/logout-all — revoca todas las sesiones del usuario. Requiere JWT válido.
export async function logoutAllAction() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (accessToken) {
    await fetch(`${process.env.API_URL}/auth/logout-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {})
  }

  await clearTokenCookies()
  redirect('/login')
}
```

---

## 5. Admin Layout — Auth Check

```typescript
// app/(admin)/layout.tsx — Server Component
import { requireSession } from '@/lib/auth'
import { SidebarClient } from '@/components/layout/SidebarClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession() // redirects to /login if no token

  return (
    <div className="flex h-screen">
      <SidebarClient />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
```

---

## 6. Token Refresh

El refresh silencioso ocurre en `proxy.ts` (no en `lib/api.ts`). El API usa **token rotation**: el endpoint devuelve un nuevo `refresh_token` en cada llamada, y revoca el anterior.

- **Request body**: `{ refresh_token: string }` — sin Bearer token (el access puede estar expirado)
- **Response**: `{ access_token: string, refresh_token: string }` — snake_case
- Si el refresh falla (token revocado/expirado), `proxy.ts` redirige a `/login`

---

## 7. Roles

The API uses `RoleType.ADMIN` and `RoleType.SUPER_ADMIN`. The admin panel only serves admin users — the middleware does not check roles (middleware only checks token presence). Role validation is enforced server-side by waiona-core.

If you need to conditionally show UI based on role, decode the JWT payload in `lib/auth.ts`:

```typescript
import { jwtDecode } from 'jwt-decode'

export async function getSessionUser() {
  const session = await getSession()
  if (!session) return null
  const payload = jwtDecode<{ sub: string; role: string }>(session.token)
  return payload
}
```
