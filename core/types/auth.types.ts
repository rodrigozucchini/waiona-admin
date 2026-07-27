import type { RoleType } from '@/core/enums'
import type { UserProfile } from './user.types'

export interface MessageResponse {
  message: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
  lastName: string
  avatar?: string
}

export type RegisterResponse = MessageResponse
export type ActivateAccountResponse = MessageResponse

export interface LoginDto {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  isActive: boolean
  role: RoleType
  profile: UserProfile
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: AuthUser
  access_token: string
  refresh_token: string
}

export interface RefreshTokenDto {
  refresh_token: string
}

// El refresh_token devuelto es nuevo en cada llamada — reemplazar el guardado, nunca reusar el viejo.
export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

export interface LogoutDto {
  refresh_token: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export type ChangePasswordResponse = MessageResponse

export interface ForgotPasswordDto {
  email: string
}

export type ForgotPasswordResponse = MessageResponse

export interface ResetPasswordDto {
  token: string
  password: string
}

export type ResetPasswordResponse = MessageResponse

export interface JwtPayload {
  sub: number
  role: RoleType | null
}
