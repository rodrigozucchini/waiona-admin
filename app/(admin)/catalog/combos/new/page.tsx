import { api } from '@/lib/api'
import Link from 'next/link'
import { ComboForm } from '@/components/forms/ComboForm'
import { createCombo } from '@/actions/combos'
import type { PaginatedResponse, Product, Category } from '@/types'

export default async function NewComboPage() {
  const [categories, productsResult] = await Promise.all([
    api.get<PaginatedResponse<Category>>('/categories?limit=100').then((r) => r.data),
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
