'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { setTokenCookies, clearTokenCookies } from '@/lib/auth'

type LoginState = { error: string } | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return { error: err?.message ?? 'Credenciales inválidas' }
  }

  const { access_token, refresh_token } = await res.json()
  await setTokenCookies(access_token, refresh_token)
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
