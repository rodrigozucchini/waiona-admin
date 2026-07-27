import type { PaymentProvider, PaymentStatus } from '@/core/enums'

export interface CreatePaymentDto {
  orderId: number
  provider: PaymentProvider
}

// El frontend debe redirigir a checkoutUrl. El status se actualiza vía webhook
// (asíncrono) — hacer polling de GET /payments/:id tras volver del checkout.
export interface PaymentResponseDto {
  id: number
  orderId: number
  provider: PaymentProvider
  status: PaymentStatus
  externalId: string
  checkoutUrl: string
  amount: number
  createdAt: string
  updatedAt: string
}
