import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ComboForm } from '@/components/forms/ComboForm'
import { updateCombo, deleteCombo } from '@/actions/combos'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { getCategories } from '@/lib/cache'
import type { PaginatedResponse, Combo, Product, ComboImage } from '@/types'

export default async function EditComboPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let combo: Combo
  try {
    combo = await api.get<Combo>(`/combos/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [categories, productsResult, images] = await Promise.all([
    getCategories(),
    api.get<PaginatedResponse<Product>>('/products?limit=100'),
    api.get<ComboImage[]>(`/combo-images/combo/${id}`).catch(() => [] as ComboImage[]),
  ])

  const updateWithId = updateCombo.bind(null, combo.id)
  const deleteWithId = deleteCombo.bind(null, combo.id)

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/combos" className="hover:underline">Combos</Link>
          <span>/</span>
          <span className="text-foreground">{combo.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{combo.name}</h1>
          <DeleteButton
            action={deleteWithId}
            label="Eliminar combo"
            confirmMessage={`¿Eliminar el combo "${combo.name}"? Esta acción no se puede deshacer.`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComboForm
            action={updateWithId}
            combo={combo}
            categories={categories}
            products={productsResult.data}
          />
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Imágenes</h2>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin imágenes</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {images
                .sort((a, b) => a.position - b.position)
                .map((img) => (
                  <div key={img.id} className="overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={combo.name}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          )}
          <Link
            href={`/catalog/combos/${combo.id}/images`}
            className="inline-block text-sm text-primary hover:underline"
          >
            Gestionar imágenes →
          </Link>
        </div>
      </div>
    </div>
  )
}
