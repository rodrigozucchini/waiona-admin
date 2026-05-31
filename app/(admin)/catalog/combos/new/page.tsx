import { api } from '@/lib/api'
import Link from 'next/link'
import { ComboForm } from '@/components/forms/ComboForm'
import { createCombo } from '@/actions/combos'
import { getCategories } from '@/lib/cache'
import type { PaginatedResponse, Product } from '@/types'

export default async function NewComboPage() {
  const [categories, productsResult] = await Promise.all([
    getCategories(),
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/combos" className="hover:underline">Combos</Link>
          <span>/</span>
          <span className="text-foreground">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-semibold">Nuevo combo</h1>
      </div>

      <ComboForm
        action={createCombo}
        categories={categories}
        products={productsResult.data}
      />
    </div>
  )
}
