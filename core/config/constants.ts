export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

export const RATE_LIMITS = {
  default: { limit: 30, windowSeconds: 60 },
  authRegister: { limit: 5, windowSeconds: 60 },
  authLogin: { limit: 5, windowSeconds: 60 },
  authForgotPassword: { limit: 3, windowSeconds: 60 },
  authResetPassword: { limit: 5, windowSeconds: 60 },
  ordersCreate: { limit: 5, windowSeconds: 60 },
} as const

export const IMAGE_UPLOAD = {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
}

export const IDEMPOTENCY_KEY_TTL_HOURS = 24

// El backend expira el access token a los 15 min y rota el refresh token en cada uso.
export const AUTH_TOKEN_TTL = {
  accessTokenMinutes: 15,
  refreshTokenDays: 30,
} as const

export const AUTH_COOKIES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const
