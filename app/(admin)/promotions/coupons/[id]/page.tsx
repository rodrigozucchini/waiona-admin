import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type {
  Coupon, CouponStatus, CouponProductTarget, CouponComboTarget,
  PaginatedResponse, Product, Combo,
} from '@/types'
import { formatDate } from '@/lib/utils'
import { CouponTargetsClient, CouponDeleteButton } from './CouponTargetsClient'

const statusConfig: Record<CouponStatus, { label: string; className: string }> = {
  active:    { label: 'Activo',     className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
  expired:   { label: 'Vencido',    className: 'bg-gray-100 text-gray-600' },
  exhausted: { label: 'Agotado',    className: 'bg-orange-100 text-orange-700' },
}

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let coupon: Coupon
  try {
    coupon = await api.get<Coupon>(`/coupons/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [productTargets, comboTargets, productsResult, combosResult] = await Promise.all([
    api.get<PaginatedResponse<CouponProductTarget>>(`/coupons/${id}/targets/products?limit=100`),
    api.get<PaginatedResponse<CouponComboTarget>>(`/coupons/${id}/targets/combos?limit=100`),
    api.get<PaginatedResponse<Product>>('/products?limit=200'),
    api.get<PaginatedResponse<Combo>>('/combos?limit=200'),
  ])

  const cfg = statusConfig[coupon.status]

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/promotions/coupons" className="hover:underline">Cupones</Link>
          <span>/</span>
          <span className="text-foreground font-mono">{coupon.code}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold font-mono">{coupon.code}</h1>
          <span className={`rounded px-2 py-0.5 text-xs ${cfg.className}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: coupon info */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3 text-sm">
            <h2 className="font-medium">Información</h2>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Valor</span>
                <span className="font-medium text-foreground">
                  {coupon.isPercentage ? `${coupon.value}%` : `$${coupon.value}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Alcance</span>
                <span className="font-medium text-foreground">
                  {coupon.isGlobal ? 'Global' : 'Específico'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Usos</span>
                <span className="font-medium text-foreground">
                  {coupon.usageCount}
                  {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ' (sin límite)'}
                </span>
              </div>
              {coupon.startsAt && (
                <div className="flex justify-between">
                  <span>Inicia</span>
                  <span className="font-medium text-foreground">{formatDate(coupon.startsAt)}</span>
                </div>
              )}
              {coupon.endsAt && (
                <div className="flex justify-between">
                  <span>Vence</span>
                  <span className="font-medium text-foreground">{formatDate(coupon.endsAt)}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground border-t pt-3">
              Los cupones no pueden editarse después de creados.
            </p>
          </div>

          <CouponDeleteButton couponId={coupon.id} code={coupon.code} />
        </div>

        {/* Right: targets */}
        <div className="lg:col-span-2">
          {coupon.isGlobal ? (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Este cupón es <strong>global</strong> — aplica a todos los productos y combos.
                No se pueden configurar targets específicos.
              </p>
            </div>
          ) : (
            <CouponTargetsClient
              couponId={coupon.id}
              productTargets={productTargets.data}
              comboTargets={comboTargets.data}
              allProducts={productsResult.data}
              allCombos={combosResult.data}
            />
          )}
        </div>
      </div>
    </div>
  )
}

