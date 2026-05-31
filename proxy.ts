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
  if (refreshToken) {
    try {
      const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (res.ok) {
        const { accessToken: newToken, refreshToken: newRefresh } = await res.json()
        const response = NextResponse.next()
        const secure = process.env.NODE_ENV === 'production'

        response.cookies.set('access_token', newToken, {
          httpOnly: true,
          secure,
          sameSite: 'lax',
          maxAge: 60 * 60,
          path: '/',
        })
        response.cookies.set('refresh_token', newRefresh, {
          httpOnly: true,
          secure,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
        return response
      }
    } catch {
      // Error de red o respuesta inválida — caer al redirect
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
