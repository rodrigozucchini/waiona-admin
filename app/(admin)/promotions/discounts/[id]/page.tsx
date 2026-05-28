import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type {
  Discount, DiscountStatus, DiscountProductTarget, DiscountComboTarget,
  PaginatedResponse, Product, Combo,
} from '@/types'
import { DiscountDetailClient } from './DiscountDetailClient'

const statusConfig: Record<DiscountStatus, { label: string; className: string }> = {
  active:    { label: 'Activo',     className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
  expired:   { label: 'Vencido',    className: 'bg-gray-100 text-gray-600' },
}

export default async function DiscountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let discount: Discount
  try {
    discount = await api.get<Discount>(`/discounts/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [productTargetsRaw, comboTargetsRaw, productsResult, combosResult] = await Promise.all([
    api.get<unknown>(`/discounts/${id}/targets/products?limit=100`),
    api.get<unknown>(`/discounts/${id}/targets/combos?limit=100`),
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
    api.get<PaginatedResponse<Combo>>('/combos?limit=100'),
  ])

  const productTargets: DiscountProductTarget[] = Array.isArray(productTargetsRaw)
    ? productTargetsRaw
    : ((productTargetsRaw as PaginatedResponse<DiscountProductTarget>).data ?? [])
  const comboTargets: DiscountComboTarget[] = Array.isArray(comboTargetsRaw)
    ? comboTargetsRaw
    : ((comboTargetsRaw as PaginatedResponse<DiscountComboTarget>).data ?? [])

  const cfg = statusConfig[discount.status]

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/promotions/discounts" className="hover:underline">Descuentos</Link>
          <span>/</span>
          <span className="text-foreground">{discount.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{discount.name}</h1>
          <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>{cfg.label}</span>
        </div>
        {discount.description && (
          <p className="text-sm text-muted-foreground mt-1">{discount.description}</p>
        )}
      </div>

      <DiscountDetailClient
        discount={discount}
        productTargets={productTargets}
        comboTargets={comboTargets}
        allProducts={productsResult.data}
        allCombos={combosResult.data}
      />
    </div>
  )
}
