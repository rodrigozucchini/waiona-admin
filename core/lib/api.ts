import { cookies } from 'next/headers'
import { API_URL } from '@/core/config/env'
import { AUTH_COOKIES } from '@/core/config/constants'
import type { ApiErrorResponse } from '@/core/types'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string | string[],
  ) {
    super(Array.isArray(message) ? message.join(', ') : message)
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options
  const token = (await cookies()).get(AUTH_COOKIES.accessToken)?.value

  const url = new URL(`${API_URL}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err: ApiErrorResponse = await res.json()
    throw new ApiError(err.statusCode, err.message)
  }

  return res.status === 204 ? (undefined as T) : res.json()
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = (await cookies()).get(AUTH_COOKIES.accessToken)?.value

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  })

  if (!res.ok) {
    const err: ApiErrorResponse = await res.json()
    throw new ApiError(err.statusCode, err.message)
  }

  return res.json()
}
