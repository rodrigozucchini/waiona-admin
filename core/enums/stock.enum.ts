export enum StockLocationType {
  WAREHOUSE = 'WAREHOUSE',
  STORE = 'STORE',
  VIRTUAL = 'VIRTUAL',
}

export enum StockOperationType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  DAMAGE = 'DAMAGE',
  RETURN = 'RETURN',
}

export enum StockFlow {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum StockReferenceType {
  ORDER = 'ORDER',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  DAMAGE_REPORT = 'DAMAGE_REPORT',
  MANUAL = 'MANUAL',
}

export enum StockWriteOffReason {
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  DEFECTIVE = 'DEFECTIVE',
  CONTAMINATED = 'CONTAMINATED',
  LOST = 'LOST',
  INVENTORY_ERROR = 'INVENTORY_ERROR',
  OTHER = 'OTHER',
}
