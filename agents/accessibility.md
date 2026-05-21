# Accessibility (a11y) — Waiona Admin

Admin panels are used daily by operators. Keyboard navigation and screen reader support are non-negotiable for professional quality.

---

## 1. Data Tables

Tables must be fully keyboard-navigable and announce dynamic changes:

```typescript
// components/tables/ProductsTable.tsx
export function ProductsTable({ data, caption }: { data: Product[]; caption: string }) {
  return (
    <div role="region" aria-label={caption}>
      <table>
        {/* caption is read by screen readers before the table */}
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">SKU</th>
            <th scope="col">Nombre</th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>
                <StatusBadge active={product.isActive} />
              </td>
              <td>
                <Link href={`/catalog/products/${product.id}`} aria-label={`Editar ${product.name}`}>
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

Key rules:
- `<th scope="col">` on all header cells
- Action buttons have `aria-label` that includes the row context (`Editar [nombre]`)
- Wrap in `role="region"` with `aria-label` for named landmark

---

## 2. Live Regions — Dynamic Content Announcements

When paginating, filtering, or loading new data, announce the result to screen readers:

```typescript
// components/tables/TableStatus.tsx
interface Props {
  total: number
  page: number
  limit: number
  isLoading: boolean
}

export function TableStatus({ total, page, limit, isLoading }: Props) {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    // aria-live="polite" announces after the user stops interacting
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {isLoading
        ? 'Cargando resultados...'
        : `Mostrando ${start} a ${end} de ${total} resultados`}
    </p>
  )
}
```

Use `aria-live="assertive"` only for errors that need immediate attention. Use `aria-live="polite"` for status updates.

---

## 3. Forms — Labels and Error Association

Every input must have an associated label. Every error message must be linked to its input:

```typescript
// components/shared/FormField.tsx
export function FormField({
  label,
  name,
  error,
  required,
  children,
}: FormFieldProps) {
  const errorId = `${name}-error`

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-destructive">*</span>
            <span className="sr-only"> (requerido)</span>
          </>
        )}
      </label>
      {/* Pass errorId and aria-invalid to the input */}
      {React.cloneElement(children as React.ReactElement, {
        id: name,
        name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
```

- `aria-invalid="true"` on the input when there's a validation error
- `aria-describedby` pointing to the error message id
- `role="alert"` on error messages triggers immediate announcement

---

## 4. Modals and Dialogs

Dialogs must trap focus and restore it on close:

```typescript
// components/shared/ConfirmDialog.tsx
'use client'
import { useRef, useEffect } from 'react'

export function ConfirmDialog({ open, onClose, onConfirm, title, description }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus the cancel button when the dialog opens (safe default)
  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      // Trap focus: handled by the dialog role in most browsers + use inert on background
    >
      <h2 id="dialog-title">{title}</h2>
      <p id="dialog-desc">{description}</p>
      <button ref={cancelRef} onClick={onClose}>Cancelar</button>
      <button onClick={onConfirm}>Confirmar</button>
    </div>
  )
}
```

Key rules:
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` → dialog title id
- `aria-describedby` → dialog description id
- Focus moves into the dialog on open, returns to trigger element on close
- Escape key closes the dialog

Prefer shadcn/ui `<Dialog>` — it handles focus trapping, escape key, and `aria-modal` automatically.

---

## 5. Loading States

Don't silently replace content. Announce loading:

```typescript
// Wrap data-heavy sections with aria-busy
<div aria-busy={isPending} aria-live="polite">
  {isPending ? <TableSkeleton /> : <ProductsTable data={products} />}
</div>
```

`aria-busy="true"` signals to screen readers that the content is being updated.

---

## 6. Status Badges

Badges with color meaning need a text fallback:

```typescript
// components/shared/StatusBadge.tsx
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={active ? 'badge-green' : 'badge-gray'}
      // Don't rely on color alone — include the text
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}
```

Never use color as the only indicator of status. The text must convey the meaning.

---

## 7. Navigation and Sidebar

```typescript
// components/layout/SidebarClient.tsx
<nav aria-label="Navegación principal">
  <ul role="list">
    {navItems.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
</nav>
```

- `aria-label` on `<nav>` to distinguish from other nav elements
- `aria-current="page"` on the active link

---

## 8. Icon Buttons

Icon-only buttons need an accessible label:

```typescript
// ✗ No accessible name
<button onClick={onDelete}>
  <TrashIcon />
</button>

// ✓ Screen reader gets the label, icon is hidden
<button onClick={onDelete} aria-label="Eliminar producto">
  <TrashIcon aria-hidden="true" />
</button>
```

Always `aria-hidden="true"` on decorative icons inside labeled elements.

---

## 9. Skip Navigation

Add a skip link so keyboard users can bypass the sidebar:

```typescript
// app/(admin)/layout.tsx
<>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:p-2"
  >
    Ir al contenido principal
  </a>
  <SidebarClient />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</>
```

---

## 10. Checklist

Per component:
- [ ] All inputs have `<label htmlFor>`
- [ ] Errors use `role="alert"` and `aria-describedby`
- [ ] Required fields indicate so in text, not only visually
- [ ] Icon buttons have `aria-label`
- [ ] Color is not the only indicator of status
- [ ] Tables have `<th scope="col">` and row context in action labels
- [ ] Dialogs have `role="dialog"`, `aria-modal`, `aria-labelledby`
- [ ] Dynamic content updates use `aria-live`
- [ ] Active nav links have `aria-current="page"`
