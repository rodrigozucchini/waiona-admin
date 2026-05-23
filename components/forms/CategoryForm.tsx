'use client'

import { useActionState } from 'react'
import type { Category } from '@/types'
import type { CategoryActionState } from '@/actions/categories'

interface Props {
  action: (prev: CategoryActionState, formData: FormData) => Promise<CategoryActionState>
  category?: Category
  categories: Category[]
}

export function CategoryForm({ action, category, categories }: Props) {
  const [state, formAction, isPending] = useActionState(action, { status: 'idle' })

  const parentOptions = categories.filter((c) => c.id !== category?.id)

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          defaultValue={category?.name}
          required
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ''}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="parentId" className="text-sm font-medium">
          Categoría padre
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ''}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Sin categoría padre</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {category && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Estado</label>
          <select
            name="isActive"
            defaultValue={category.isActive ? 'true' : 'false'}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
        </button>
        <a
          href="/catalog/categories"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
