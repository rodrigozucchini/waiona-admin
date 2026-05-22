import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { JWTPayload } from '@/types'

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

export async function setTokenCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const session = await getSession()
  if (!session) return null
  const [, payload] = session.token.split('.')
  return JSON.parse(Buffer.from(payload, 'base64url').toString()) as JWTPayload
}

export async function clearTokenCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}
