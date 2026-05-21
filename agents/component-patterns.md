# Component Patterns — Shared UI Conventions

Reusable patterns and components used across all modules in the Waiona Admin panel.

---

## 1. StatusBadge

```typescript
// components/shared/StatusBadge.tsx
interface Props {
  active: boolean
  labelActive?: string
  labelInactive?: string
}

export function StatusBadge({
  active,
  labelActive = 'Activo',
  labelInactive = 'Inactivo',
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        active
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {active ? labelActive : labelInactive}
    </span>
  )
}
```

---

## 2. OrderStatusBadge

```typescript
// components/shared/OrderStatusBadge.tsx
import type { OrderStatus } from '@/types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Enviada',    className: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Entregada',  className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada',  className: 'bg-red-100 text-red-700' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
```

---

## 3. ConfirmDialog (Destructive Actions)

```typescript
// components/shared/ConfirmDialog.tsx
'use client'
import { useTransition } from 'react'

interface Props {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<unknown>
  trigger: React.ReactNode
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  trigger,
  variant = 'default',
}: Props) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (window.confirm(`${title}\n\n${description}`)) {
      startTransition(() => onConfirm())
    }
  }

  return (
    <span
      onClick={handleConfirm}
      className={isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    >
      {trigger}
    </span>
  )
}
```

---

## 4. PageHeader

```typescript
// components/shared/PageHeader.tsx
import Link from 'next/link'

interface Action {
  label: string
  href?: string
  onClick?: () => void
}

interface Props {
  title: string
  description?: string
  action?: Action
  breadcrumbs?: Array<{ label: string; href: string }>
}

export function PageHeader({ title, description, action, breadcrumbs }: Props) {
  return (
    <div className="mb-6 space-y-1">
      {breadcrumbs && (
        <nav className="flex gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            </span>
          ))}
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          action.href
            ? <Link href={action.href} className="btn-primary">{action.label}</Link>
            : <button onClick={action.onClick} className="btn-primary">{action.label}</button>
        )}
      </div>
    </div>
  )
}
```

---

## 5. EmptyState

```typescript
// components/shared/EmptyState.tsx
interface Props {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <svg className="h-8 w-8 text-muted-foreground" /* icon */ />
      </div>
      <h3 className="mt-4 font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="mt-4 btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  )
}
```

---

## 6. FormField Wrapper

Consistent label + input + error layout for all forms:

```typescript
// components/shared/FormField.tsx
interface Props {
  label: string
  name: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, name, error, required, children }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

## 7. Sidebar Navigation Structure

```typescript
// components/layout/nav-items.ts — not a component, just config
export const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Catálogo',
    icon: 'Package',
    children: [
      { label: 'Productos', href: '/catalog/products' },
      { label: 'Combos', href: '/catalog/combos' },
      { label: 'Categorías', href: '/catalog/categories' },
    ],
  },
  {
    label: 'Precios',
    icon: 'DollarSign',
    children: [
      { label: 'Márgenes', href: '/pricing/margins' },
      { label: 'Productos', href: '/pricing/products' },
      { label: 'Combos', href: '/pricing/combos' },
    ],
  },
  {
    label: 'Impuestos',
    href: '/taxes',
    icon: 'Receipt',
  },
  {
    label: 'Inventario',
    icon: 'Warehouse',
    children: [
      { label: 'Stock', href: '/stock/items' },
      { label: 'Ubicaciones', href: '/stock/locations' },
      { label: 'Movimientos', href: '/stock/movements' },
      { label: 'Bajas', href: '/stock/write-offs' },
    ],
  },
  {
    label: 'Promociones',
    icon: 'Tag',
    children: [
      { label: 'Cupones', href: '/promotions/coupons' },
      { label: 'Descuentos', href: '/promotions/discounts' },
    ],
  },
  {
    label: 'Órdenes',
    href: '/orders',
    icon: 'ShoppingCart',
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: 'Users',
  },
]
```

---

## 8. Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}

export function formatEnum(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
```

---

## 9. Types Pattern — All in types/index.ts

Keep all API-derived types in one file. Group by module:

```typescript
// types/index.ts

// --- Shared ---
export interface PaginatedResponse<T> { ... }
export type RoleType = 'super_admin' | 'admin' | 'client'

// --- Products ---
export interface Product { id: string; sku: string; name: string; ... }
export interface CreateProductDto { sku: string; name: string; ... }
export interface UpdateProductDto { name?: string; ... }

// --- Orders ---
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export interface Order { id: string; status: OrderStatus; ... }

// ... etc per module
```

Never use `any`. Use `unknown` with type guards at API boundaries if the shape is uncertain.
