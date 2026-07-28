'use server'

import { cookies } from 'next/headers'
import { apiRequest, ApiError } from '@/core/lib/api'
import { cookieOptions } from '@/core/lib/cookies'
import { AUTH_TOKEN_TTL, AUTH_COOKIES } from '@/core/config/constants'
import type { LoginDto, LoginResponse } from '@/core/types'

export async function login(data: LoginDto) {
  try {
    const { user, access_token, refresh_token } = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data,
    })

    const store = await cookies()
    store.set(AUTH_COOKIES.accessToken, access_token, cookieOptions(AUTH_TOKEN_TTL.accessTokenMinutes * 60))
    store.set(AUTH_COOKIES.refreshToken, refresh_token, cookieOptions(AUTH_TOKEN_TTL.refreshTokenDays * 24 * 60 * 60))

    return { success: true as const, user }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
    return { success: false as const, message }
  }
}

export async function logout() {
  const store = await cookies()
  const refreshToken = store.get(AUTH_COOKIES.refreshToken)?.value

  if (refreshToken) {
    await apiRequest('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } }).catch(() => {})
  }

  store.delete(AUTH_COOKIES.accessToken)
  store.delete(AUTH_COOKIES.refreshToken)
}
