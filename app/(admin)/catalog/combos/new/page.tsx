import { api } from '@/lib/api'
import Link from 'next/link'
import { ComboForm } from '@/components/forms/ComboForm'
import { createCombo } from '@/actions/combos'
import type { PaginatedResponse, Category, Product } from '@/types'

export default async function NewComboPage() {
  const [categoriesResult, productsResult] = await Promise.all([
    api.get<PaginatedResponse<Category>>('/categories?limit=100'),
    api.get<PaginatedResponse<Product>>('/products?limit=200&isActive=true'),
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
        categories={categoriesResult.data}
        products={productsResult.data}
      />
    </div>
  )
}
