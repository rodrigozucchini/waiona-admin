export enum PaymentProvider {
  MERCADOPAGO = 'mercadopago',
  // Declarado en el backend pero sin implementar todavía.
  STRIPE = 'stripe',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}
