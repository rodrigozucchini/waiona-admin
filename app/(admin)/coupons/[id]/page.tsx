import { notFound } from 'next/navigation'
import { getCoupon } from '@/services/coupon.service'
import { getProducts } from '@/services/product.service'
import { getCombos } from '@/services/combo.service'
import { getCouponComboTargets, getCouponProductTargets } from '@/services/coupon-target.service'
import { getCouponUsage } from '@/services/coupon-usage.service'
import { ApiError } from '@/core/lib/api'
import { CouponForm } from '../CouponForm'
import { CouponProductTargets } from './CouponProductTargets'
import { CouponComboTargets } from './CouponComboTargets'
import { CouponUsageList } from './CouponUsageList'

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const couponId = Number(id)

  const coupon = await getCoupon(couponId).catch((error) => {
    if (error instanceof ApiError && error.statusCode === 404) notFound()
    throw error
  })

  const [{ data: products }, { data: combos }, productTargets, comboTargets, usage] =
    await Promise.all([
      getProducts({ limit: 100 }),
      getCombos({ limit: 100 }),
      getCouponProductTargets(couponId),
      getCouponComboTargets(couponId),
      getCouponUsage(couponId),
    ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Editar cupón</h1>
        <CouponForm coupon={coupon} />
      </div>

      {coupon.isGlobal ? (
        <p className="max-w-sm rounded border p-3 text-sm text-neutral-500">
          Este cupón es global: aplica a cualquier orden, no se le pueden asignar productos ni
          combos.
        </p>
      ) : (
        <>
          <CouponProductTargets couponId={couponId} targets={productTargets} products={products} />
          <CouponComboTargets couponId={couponId} targets={comboTargets} combos={combos} />
        </>
      )}

      <CouponUsageList usage={usage} />
    </div>
  )
}
