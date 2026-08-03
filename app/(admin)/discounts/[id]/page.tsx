import { notFound } from 'next/navigation'
import { getDiscount } from '@/services/discount.service'
import { getProducts } from '@/services/product.service'
import { getCombos } from '@/services/combo.service'
import {
  getDiscountComboTargets,
  getDiscountProductTargets,
} from '@/services/discount-target.service'
import { ApiError } from '@/core/lib/api'
import { DiscountForm } from '../DiscountForm'
import { DiscountProductTargets } from './DiscountProductTargets'
import { DiscountComboTargets } from './DiscountComboTargets'

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const discountId = Number(id)

  const [discount, { data: products }, { data: combos }, productTargets, comboTargets] =
    await Promise.all([
      getDiscount(discountId).catch((error) => {
        if (error instanceof ApiError && error.statusCode === 404) notFound()
        throw error
      }),
      getProducts({ limit: 100 }),
      getCombos({ limit: 100 }),
      getDiscountProductTargets(discountId),
      getDiscountComboTargets(discountId),
    ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Editar descuento</h1>
        <DiscountForm discount={discount} />
      </div>
      <DiscountProductTargets discountId={discountId} targets={productTargets} products={products} />
      <DiscountComboTargets discountId={discountId} targets={comboTargets} combos={combos} />
    </div>
  )
}
