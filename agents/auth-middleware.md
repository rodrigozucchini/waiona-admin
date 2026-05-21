# Auth & Middleware — Waiona Admin

JWT-based authentication for the admin panel. Tokens stored in **httpOnly cookies** only.

---

## 1. Cookie Strategy

- `access_token` — httpOnly, secure, sameSite=lax, short-lived
- `refresh_token` — httpOnly, secure, sameSite=lax, longer-lived
- Never use `localStorage` or `sessionStorage` for tokens.
- Never expose tokens to Client Components.

---

## 2. middleware.ts

Runs on every request. Redirects unauthenticated users to `/login`.

```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in → redirect away from login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
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
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

  const { accessToken, refreshToken } = await res.json()
  await setTokenCookies(accessToken, refreshToken)
  redirect('/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (token) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
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

When the access token expires, refresh silently in the Route Handler:

```typescript
// lib/api.ts — add refresh logic
async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return null
  return res.json() // { accessToken, refreshToken }
}
```

The middleware intercepts 401 responses, attempts refresh, and retries. If refresh fails, clears cookies and redirects to `/login`.

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
