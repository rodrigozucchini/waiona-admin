# Forms & Server Actions — Mutations in Waiona Admin

All create/update/delete operations use **Server Actions** with `useActionState` (React 19).
Never build client-side fetch calls for mutations.

---

## 1. Server Action Pattern

```typescript
// actions/products.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { CreateProductDto, UpdateProductDto, Product } from '@/types'

type ActionState = { error?: string; fieldErrors?: Record<string, string> } | null

export async function createProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const dto: CreateProductDto = {
    sku: formData.get('sku') as string,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    categoryId: formData.get('categoryId') as string,
    measurementUnit: formData.get('measurementUnit') as string,
    measurementValue: Number(formData.get('measurementValue')),
  }

  // Server-side validation before hitting the API
  if (!dto.sku || !dto.name) {
    return { error: 'SKU y nombre son requeridos' }
  }

  try {
    await api.post<Product>('/products', dto)
  } catch (err) {
    if (err instanceof ApiError) {
      // 400 validation errors from API return message[]
      return { error: err.message }
    }
    return { error: 'Error al crear el producto' }
  }

  revalidateTag('products')
  redirect('/catalog/products')
}

export async function updateProduct(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const dto: UpdateProductDto = {}

  const name = formData.get('name') as string
  if (name) dto.name = name

  try {
    await api.patch<Product>(`/products/${id}`, dto)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al actualizar' }
  }

  revalidateTag('products')
  revalidatePath(`/catalog/products/${id}`)
  return null
}

export async function deleteProduct(id: string): Promise<ActionState> {
  try {
    await api.delete(`/products/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    return { error: 'Error al eliminar' }
  }

  revalidateTag('products')
  redirect('/catalog/products')
}
```

---

## 2. Form Component with useActionState

```typescript
// components/forms/ProductForm.tsx
'use client'
import { useActionState } from 'react'
import { createProduct } from '@/actions/products'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
}

export function ProductForm({ categories }: Props) {
  const [state, formAction, isPending] = useActionState(createProduct, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="sku">SKU</label>
        <input id="sku" name="sku" required />
        {state?.fieldErrors?.sku && (
          <p className="text-destructive text-sm">{state.fieldErrors.sku}</p>
        )}
      </div>

      <div>
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" required />
      </div>

      <div>
        <label htmlFor="categoryId">Categoría</label>
        <select id="categoryId" name="categoryId" required>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p role="alert" className="text-destructive">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Crear producto'}
      </button>
    </form>
  )
}
```

---

## 3. Edit Form — Binding an ID

For edit forms, bind the ID before passing to `useActionState`:

```typescript
// components/forms/ProductEditForm.tsx
'use client'
import { useActionState } from 'react'
import { updateProduct } from '@/actions/products'

interface Props {
  product: Product
  categories: Category[]
}

export function ProductEditForm({ product, categories }: Props) {
  // Bind the product ID into the action
  const updateWithId = updateProduct.bind(null, product.id)
  const [state, formAction, isPending] = useActionState(updateWithId, null)

  return (
    <form action={formAction} className="space-y-4">
      <input name="name" defaultValue={product.name} />
      {/* ... */}
      {state?.error && <p role="alert">{state.error}</p>}
      <button disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar'}</button>
    </form>
  )
}
```

---

## 4. Delete with Confirmation

Deletes use a form action wrapped in a confirm dialog. Never fire a delete on a single click.

```typescript
// components/shared/DeleteButton.tsx
'use client'
import { useTransition } from 'react'

interface Props {
  action: () => Promise<unknown>
  label?: string
}

export function DeleteButton({ action, label = 'Eliminar' }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-destructive"
    >
      {isPending ? 'Eliminando...' : label}
    </button>
  )
}
```

```typescript
// Usage in page
import { deleteProduct } from '@/actions/products'
import { DeleteButton } from '@/components/shared/DeleteButton'

<DeleteButton action={deleteProduct.bind(null, product.id)} />
```

---

## 5. Cache Revalidation Strategy

| Tag | Used for | Revalidate in |
|-----|----------|---------------|
| `'products'` | All product lists | createProduct, updateProduct, deleteProduct |
| `'combos'` | All combo lists | createCombo, updateCombo, deleteCombo |
| `'categories'` | Category tree + lists | createCategory, updateCategory, deleteCategory |
| `'stock'` | Stock items/movements | All stock operations |
| `'orders'` | Order lists | updateOrderStatus |
| `'pricing'` | Pricing tables | updatePricing, createMargin |
| `'coupons'` | Coupon lists | CRUD coupons |
| `'discounts'` | Discount lists | CRUD discounts |

Always call `revalidateTag` after mutations. Use `revalidatePath` only for detail pages where you know the exact path.

---

## 6. Rules

- Server Actions live in `actions/<module>.ts`, never inline in components.
- Always return `ActionState | null` — `null` means success with no message.
- Validate server-side in the action before calling the API (never trust the client).
- Use `.bind(null, id)` to partially apply IDs into actions for edit/delete.
- `redirect()` inside a Server Action handles navigation after successful mutations.
- Show a loading state via `isPending` from `useActionState`.
- Show field-level errors when the API returns a `message[]` array.
- Use `revalidateTag` over `revalidatePath` — tags are more precise and composable.
