# Cómo funciona el estado en waiona-admin

El proyecto tiene **cuatro capas de estado** con responsabilidades claramente separadas. No hay Redux, no hay Context API, no hay `zustand`. Todo es React 19 + Next.js 16 App Router.

---

## Capa 1: ActionState — estado de mutations

Cada módulo define su propio tipo discriminado en el archivo de la action:

```ts
// actions/products.ts
export type ProductActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }
```

Todos los módulos siguen exactamente este mismo shape (`idle | error | success`). Los nombres son distintos por módulo (`ProductActionState`, `StockActionState`, `PricingActionState`, etc.) pero la estructura es idéntica.

**Reglas:**
- `idle` — estado inicial, no se muestra nada
- `error` — siempre tiene `message: string` (TypeScript lo garantiza con la union)
- `success` — acción completada sin error. Puede venir de dos fuentes:
  - La action retorna `{ status: 'success' }` → actualización in-page
  - La action llama `redirect()` → navegación completa (no necesita `success`)

**Cuándo se usa cada salida:**

| Acción | Salida |
|--------|--------|
| `createProduct` | `redirect('/catalog/products')` — va a la lista |
| `updateProduct` | `return { status: 'success' }` — se queda en la misma página |
| `deleteProduct` | `redirect('/catalog/products')` — vuelve a la lista |
| `addStock`, `writeOff`, `updateThresholds` | `return { status: 'success' }` — panel inline |

---

## Capa 2: useActionState — el puente entre action y formulario

El hook de React 19 que conecta todo. Patrón en todos los formularios:

```ts
const [state, formAction, isPending] = useActionState(action, { status: 'idle' })
```

Cuando la action necesita un ID (editar, eliminar), se usa `.bind` antes de pasarlo al hook:

```ts
// modo edición
const updateWithId = updateProduct.bind(null, product.id)
const [state, formAction, isPending] = useActionState(updateWithId, { status: 'idle' })
```

**Cómo se consumen los tres valores:**
- `state` → se lee en el render para mostrar errores o disparar side effects
- `formAction` → va directo al `action=` del `<form>`
- `isPending` → deshabilita el botón de submit y cambia el label

**Patrón para toasts (success):**

No se muestra `success` en el JSX con `role="alert"`. En cambio, se escucha el cambio con `useEffect`:

```ts
useEffect(() => {
  if (state.status === 'success') toast.success('Producto actualizado')
}, [state.status])
```

**Patrón para errores:**

Los errores se muestran inline en el JSX con `role="alert"`:

```tsx
{state.status === 'error' && (
  <p role="alert" className="text-sm text-destructive">
    {state.message}
  </p>
)}
```

TypeScript obliga a verificar `state.status === 'error'` antes de acceder a `state.message` porque es una discriminated union.

**Validación antes del API:**

Todas las actions validan con Zod antes de llamar a `api.*`. El primer error de Zod se mapea al `message`:

```ts
if (!result.success) {
  return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
}
```

Los errores del API (`ApiError`) también se capturan y mapean al mismo shape, incluyendo casos especiales como 409:

```ts
if (err.status === 409) return { status: 'error', message: 'El SKU ya existe' }
```

---

## Capa 3: URL — estado de listas y filtros

Los listados nunca usan `useState` para página, filtros, o búsqueda. **La URL es la única fuente de verdad.**

**Server Component — lee la URL:**

```ts
// app/(admin)/catalog/products/page.tsx
export default async function ProductsPage({ searchParams }) {
  const { page = '1', limit = '20', search } = await searchParams
  const result = await api.get<PaginatedResponse<Product>>(`/products?${query}`)
}
```

**Client Component — escribe la URL:**

```ts
// app/(admin)/orders/OrdersFilters.tsx
const router = useRouter()
const pathname = usePathname()

function handleChange(value: string) {
  const params = new URLSearchParams()
  params.set('page', '1')
  if (value) params.set('status', value)
  router.push(`${pathname}?${params}`)
}
```

Para filtros con feedback de loading se agrega `useTransition`:

```ts
const [isPending, startTransition] = useTransition()
startTransition(() => router.push(`${pathname}?${params}`))
```

`isPending` del `useTransition` sirve para mostrar opacidad mientras el Server Component re-fetches.

La paginación en páginas más simples usa `<Link href="?page=...">` directamente en el Server Component, sin Client Component.

---

## Capa 4: Estado local de UI

`useState` solo para estado efímero que no necesita persistir en la URL ni en el servidor.

**Panel abierto** — el caso más común (`StockItemClient`):

```ts
type Panel = 'add' | 'writeoff' | 'damage' | 'thresholds' | null
const [panel, setPanel] = useState<Panel>(null)
```

Cada panel tiene su propio `useActionState`. Al completarse con éxito, el `useEffect` llama `setPanel(null)` para cerrarlo.

**Fila en edición** — `LocationsClient`:

```ts
const [editingId, setEditingId] = useState<number | null>(null)
```

**Error de delete inline** — cuando delete no redirige sino que es in-page:

```ts
const [deleteError, setDeleteError] = useState<string | null>(null)
const [isPending, startTransition] = useTransition()
```

Acá `useTransition` + `startTransition` se usa en lugar de `useActionState` porque el delete se invoca con `onClick`, no desde un `<form>`.

---

## Capa transversal: caché del servidor

No hay caché cross-request. El comment en `lib/cache.ts` lo explica:

> *Cross-request caching via `unstable_cache`/`use cache` es incompatible con per-request auth tokens.*

Solo se usa `React.cache()`, que **deduplica llamadas dentro de un mismo render tree** (mismo request):

```ts
// lib/cache.ts
export const getCategories = cache(async () => {
  const result = await api.get<PaginatedResponse<Category>>('/categories?limit=100')
  return result.data
})
```

Esto permite que múltiples Server Components en la misma página llamen `getCategories()` y solo se haga un fetch. Pero entre requests siempre va fresco.

Las mutations no necesitan `revalidateTag` porque los redirects de Next.js provocan un nuevo render (y nuevo fetch). Las operaciones in-page que retornan `{ status: 'success' }` sin redirect muestran el estado via toast pero **no actualizan los datos en pantalla** — si el dato cambió (ej. stock), hay que navegar o refrescar.

---

## Resumen: quién maneja qué

| Tipo de estado | Mecanismo | Dónde vive |
|---|---|---|
| Estado de form/mutation | `useActionState` + `ActionState` | Client Component |
| Validación | Zod en la Server Action | Server |
| Errores del API | `ApiError` mapeado en la action | Server → Client via `ActionState` |
| Filtros, paginación | `searchParams` de la URL | URL (Server + Client) |
| Panel UI abierto | `useState<Panel>` | Client Component |
| Fila en edición | `useState<number | null>` | Client Component |
| Toasts de éxito | `useEffect` → `toast.success()` | Client Component |
| Loading de mutations | `isPending` de `useActionState` | Client Component |
| Loading de navegación | `isPending` de `useTransition` | Client Component |
| Dedup de fetches | `React.cache()` | Server (per-request) |
| Tema (dark/light) | `ThemeProvider` de `next-themes` | `app/providers.tsx` |
