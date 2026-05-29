import { api, ApiError } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageUploadForm, ImageCard } from './ComboImagesClient'
import {
  uploadComboImage,
  deleteComboImage,
  updateComboImagePosition,
} from '@/actions/combo-images'
import type { Combo, ComboImage } from '@/types'

export default async function ComboImagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const comboId = Number(id)

  let combo: Combo
  try {
    combo = await api.get<Combo>(`/combos/${comboId}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const images = await api
    .get<ComboImage[]>(`/combo-images/combo/${comboId}`)
    .catch(() => [] as ComboImage[])

  const sorted = [...images].sort((a, b) => a.position - b.position)
  const nextPosition = sorted.length > 0 ? sorted[sorted.length - 1].position + 1 : 1

  const uploadAction = uploadComboImage.bind(null, comboId)
  const deleteAction = deleteComboImage.bind(null, comboId)
  const updatePositionAction = updateComboImagePosition.bind(null, comboId)

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex gap-1 text-sm text-muted-foreground mb-1">
          <Link href="/catalog/combos" className="hover:underline">Combos</Link>
          <span>/</span>
          <Link href={`/catalog/combos/${comboId}`} className="hover:underline">
            {combo.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Imágenes</span>
        </nav>
        <h1 className="text-2xl font-semibold">Imágenes — {combo.name}</h1>
        <p className="text-sm text-muted-foreground">{sorted.length} imagen{sorted.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center text-muted-foreground">
              <p className="font-medium">Sin imágenes</p>
              <p className="mt-1 text-sm">Subí la primera imagen del combo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {sorted.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  deleteAction={deleteAction}
                  updatePositionAction={updatePositionAction}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <ImageUploadForm uploadAction={uploadAction} nextPosition={nextPosition} />
        </div>
      </div>
    </div>
  )
}
