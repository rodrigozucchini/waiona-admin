import { cookies } from 'next/headers'

const BASE = process.env.API_URL

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
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

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, ...init } = options

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('access_token')?.value

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      ...init.headers,
    },
    ...(body !== undefined && { body: body instanceof FormData ? body : JSON.stringify(body) }),
  })

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') ?? '60'
    throw new ApiError(429, `Demasiadas solicitudes. Intentá en ${retryAfter} segundos.`)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }))
    throw new ApiError(res.status, err.message, err.error)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

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
