'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  deleteProductImage,
  updateProductImage,
  uploadProductImage,
} from '@/actions/product-image.actions'
import type { ProductImageResponseDto } from '@/core/types'

interface ProductImagesProps {
  productId: number
  images: ProductImageResponseDto[]
}

export function ProductImages({ productId, images }: ProductImagesProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [position, setPosition] = useState(String(images.length + 1))
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error('Elegí un archivo')
      return
    }

    const formData = new FormData()
    formData.set('file', file)
    formData.set('productId', String(productId))
    formData.set('position', position)

    startTransition(async () => {
      const result = await uploadProductImage(formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success('Imagen subida')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setPosition(String(images.length + 2))
      router.refresh()
    })
  }

  function handlePositionChange(id: number, newPosition: string) {
    startTransition(async () => {
      const result = await updateProductImage(id, { position: Number(newPosition) })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      router.refresh()
    })
  }

  function handleDelete(id: number) {
    if (!confirm('¿Borrar esta imagen?')) return
    startTransition(async () => {
      const result = await deleteProductImage(id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex max-w-sm flex-col gap-3 rounded border p-3">
      <span className="text-sm font-medium">Imágenes</span>

      {images.length > 0 && (
        <ul className="flex flex-col gap-2">
          {images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((image) => (
              <li key={image.id} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-12 w-12 rounded object-cover" />
                <input
                  type="number"
                  min={1}
                  defaultValue={image.position}
                  disabled={isPending}
                  onBlur={(e) => handlePositionChange(image.id, e.target.value)}
                  className="w-16 rounded border px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(image.id)}
                  className="text-sm text-red-600 disabled:opacity-50"
                >
                  Borrar
                </button>
              </li>
            ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm"
        />
        <input
          type="number"
          min={1}
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-16 rounded border px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded border px-2 py-1 text-sm disabled:opacity-50"
        >
          Subir
        </button>
      </form>
    </div>
  )
}
