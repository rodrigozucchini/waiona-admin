'use client'

import { useActionState, useRef, useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { ProductImage } from '@/types'
import type { ImageActionState } from '@/actions/product-images'

interface UploadFormProps {
  uploadAction: (prev: ImageActionState, formData: FormData) => Promise<ImageActionState>
  nextPosition: number
}

export function ImageUploadForm({ uploadAction, nextPosition }: UploadFormProps) {
  const [state, formAction, isPending] = useActionState(uploadAction, { status: 'idle' })
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') toast.success('Imagen subida correctamente')
    if (state.status === 'error') toast.error(state.message)
  }, [state.status])

  const hasFile = !!selectedFile && !isPending

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd)
        formRef.current?.reset()
        setSelectedFile(null)
      }}
      className="space-y-3 rounded-lg border p-4"
    >
      <p className="text-sm font-medium">Subir imagen</p>

      <input type="hidden" name="position" value={nextPosition} />

      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isPending
            ? 'border-muted bg-muted/30'
            : hasFile
            ? 'border-green-500 bg-green-50'
            : 'hover:border-primary'
        }`}
        onClick={() => !isPending && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          required
          onChange={(e) => setSelectedFile(e.target.files?.[0]?.name ?? null)}
        />
        {isPending ? (
          <p className="text-sm text-muted-foreground">Subiendo...</p>
        ) : hasFile ? (
          <>
            <p className="text-sm font-medium text-green-700">{selectedFile}</p>
            <p className="mt-1 text-xs text-green-600">Listo para subir</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Click para seleccionar imagen</p>
            <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, GIF — máx 5 MB</p>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedFile}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Subiendo...' : 'Subir imagen'}
      </button>
    </form>
  )
}

interface ImageCardProps {
  image: ProductImage
  deleteAction: (imageId: number) => Promise<ImageActionState>
  updatePositionAction: (imageId: number, prev: ImageActionState, formData: FormData) => Promise<ImageActionState>
}

export function ImageCard({ image, deleteAction, updatePositionAction }: ImageCardProps) {
  const [isPendingDelete, startDelete] = useTransition()
  const boundUpdate = updatePositionAction.bind(null, image.id)
  const [posState, posFormAction, isPendingPos] = useActionState(boundUpdate, { status: 'idle' })

  useEffect(() => {
    if (posState.status === 'success') toast.success('Posición actualizada')
  }, [posState.status])

  function handleDelete() {
    if (!confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) return
    startDelete(async () => {
      const result = await deleteAction(image.id)
      if (result.status === 'error') toast.error(result.message)
      else toast.success('Imagen eliminada')
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Imagen posición ${image.position}`}
        className="h-40 w-full object-cover"
      />
      <div className="space-y-2 p-3">
        <form action={posFormAction} className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Posición</label>
          <input
            name="position"
            type="number"
            min="1"
            defaultValue={image.position}
            className="w-16 rounded border px-2 py-1 text-center text-sm"
          />
          <button
            type="submit"
            disabled={isPendingPos}
            className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
          >
            {isPendingPos ? '...' : 'Guardar'}
          </button>
        </form>
        {posState.status === 'error' && (
          <p className="text-xs text-destructive">{posState.message}</p>
        )}

        <button
          onClick={handleDelete}
          disabled={isPendingDelete}
          className="w-full rounded border border-destructive py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {isPendingDelete ? 'Eliminando...' : 'Eliminar imagen'}
        </button>
      </div>
    </div>
  )
}
