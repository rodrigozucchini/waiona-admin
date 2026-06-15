# Estructura del Proyecto — Waiona Admin

Guía de referencia de las cuatro carpetas principales. Cada sección explica qué responsabilidad tiene la carpeta, qué hay adentro y cómo se relaciona con el resto del proyecto.

---

## `lib/` — Utilidades del servidor

Código que corre exclusivamente en el servidor. Nunca se importa desde un componente `'use client'`.

| Archivo | Qué hace |
|---------|----------|
| `api.ts` | Cliente HTTP central. Define `apiRequest<T>`, la clase `ApiError`, el type guard `isApiError`, y el objeto `api` con métodos `get / post / patch / delete`. Todas las llamadas a waiona-core pasan por acá. Lee el `access_token` de las cookies de forma automática. |
| `auth.ts` | Helpers de sesión. Expone `getSession()`, `requireSession()` (redirige a `/login` si no hay token), `setTokenCookies()`, `clearTokenCookies()` y `getSessionUser()` (decodifica el JWT para obtener rol y sub). |
| `cache.ts` | Fetchers de datos de referencia deduplicados con `React.cache()`. Incluye `getCategories`, `getStockLocations`, `getTaxTypes` y `getMargins`. Se usan en formularios que necesitan listar opciones (selects), sin hacer múltiples requests al mismo dato dentro de un render. |
| `utils.ts` | Helpers puros. `cn()` para combinar clases Tailwind, `formatCurrency()` con locale `es-AR`, `formatDate()` y `formatEnum()` para presentar valores de API. |

---

## `actions/` — Server Actions (mutaciones)

Todas las operaciones de creación, edición y eliminación. Cada archivo corresponde a un dominio del API. Todos los archivos tienen `'use server'` en la primera línea. Validan con **Zod** antes de llamar a la API y retornan un estado discriminado (`{ status: 'idle' | 'error' | 'success' }`).

| Archivo | Dominio | Funciones principales |
|---------|---------|----------------------|
| `auth.ts` | Autenticación | `loginAction` (login + set cookies), `logoutAction` (revoca refresh token), `logoutAllAction` (cierra todas las sesiones) |
| `products.ts` | Productos | `createProduct`, `updateProduct`, `deleteProduct` |
| `categories.ts` | Categorías | `createCategory`, `updateCategory`, `deleteCategory` |
| `combos.ts` | Combos | `createCombo`, `updateCombo`, `deleteCombo` — los items del combo viajan como JSON serializado en un campo hidden del form |
| `orders.ts` | Órdenes | `updateOrderStatus` — único campo editable de una orden desde el admin |
| `pricing.ts` | Precios y márgenes | `createMargin`, `updateMargin`, `deleteMargin`, `createProductPricing`, `updateProductPricing`, `deleteProductPricing`, `createComboPricing`, `updateComboPricing`, `deleteComboPricing` |
| `taxes.ts` | Impuestos | `createTaxType`, `deleteTaxType`, `createTax`, `deleteTax`, `assignTaxToProduct`, `removeTaxFromProduct` |
| `promotions.ts` | Cupones y descuentos | CRUD de cupones y descuentos + acciones para asignar/remover productos y combos como targets (`addCouponProductTarget`, `removeCouponProductTarget`, etc.) |
| `stock.ts` | Inventario | `createStockLocation`, `updateStockLocation`, `deleteStockLocation`, `createStockItem`, `addStock`, `writeOff`, `writeOffDamage` (incluye `reportedBy` del JWT), `updateThresholds` |
| `product-images.ts` | Imágenes de productos | `uploadProductImage` (valida tipo/tamaño y envía multipart), `deleteProductImage`, `updateImagePosition` |
| `combo-images.ts` | Imágenes de combos | Mismo patrón que `product-images.ts` pero para combos |

---

## `components/` — Componentes de UI

Divididos en cuatro subcarpetas según su rol. Los componentes con `'use client'` son los que necesitan estado, eventos o navegación programática.

### `components/layout/`

Shell visual del panel. Se monta una sola vez en `app/(admin)/layout.tsx`.

| Archivo | Tipo | Qué hace |
|---------|------|----------|
| `SidebarClient.tsx` | Client | Sidebar colapsable con navegación anidada. Lee `usePathname()` para marcar el ítem activo con `aria-current="page"`. Maneja los grupos plegables (Catálogo, Inventario, etc.) con estado local. |
| `HeaderClient.tsx` | Client | Barra superior. Muestra el email/rol del usuario y el botón de logout. Llama a `logoutAction` dentro de `useTransition`. |
| `nav-items.ts` | Config | Array con la estructura del menú: ítems de primer nivel con icono y nombre, subitems con href. No es un componente React. |

### `components/forms/`

Formularios interactivos. Todos son `'use client'` y usan `useActionState` de React 19 para conectarse con las Server Actions correspondientes.

| Archivo | Qué hace |
|---------|----------|
| `LoginForm.tsx` | Formulario de login. Conectado a `loginAction`. Muestra error si las credenciales fallan. |
| `ProductForm.tsx` | Formulario dual (crear/editar). Recibe `action` como prop para poder usarse con `createProduct` o `updateProduct.bind(null, id)`. Muestra toast de éxito y error inline. |
| `CategoryForm.tsx` | Formulario de categoría con soporte para categoría padre (select anidado). |
| `ComboForm.tsx` | Formulario de combo con un builder interactivo de ítems (productos + cantidades). Los ítems se serializan a JSON antes de enviarse. |

### `components/dashboard/`

Widgets asíncronos del dashboard. Cada uno es un Server Component que hace su propio fetch, por lo que pueden cargarse en paralelo dentro de boundaries `<Suspense>`.

| Archivo | Tipo | Qué hace |
|---------|------|----------|
| `OrderSummaryWidget.tsx` | Server | KPIs de órdenes por estado e ingresos totales. Cachea la respuesta 60 segundos con `unstable_cache`. |
| `TopProductsWidget.tsx` | Server | Tabla con los 10 productos más vendidos por unidades e ingresos. |
| `CriticalStockWidget.tsx` | Server | Lista de ítems de stock por debajo del umbral crítico, con links directos al ítem. |
| `KpiCard.tsx` | Server | Tarjeta genérica de métrica con colores por variante (yellow, blue, green, red, purple). |
| `WidgetSkeleton.tsx` | Server | Placeholder animado para el estado de carga de cada widget. |

### `components/shared/`

Componentes reutilizables sin dominio específico.

| Archivo | Tipo | Qué hace |
|---------|------|----------|
| `DeleteButton.tsx` | Client | Botón de eliminar con `confirm()` antes de ejecutar la acción. Muestra toast de error si la acción falla. Recibe la acción ya bindeada como prop. |
| `StatusBadge.tsx` | Server | Badge de estado activo/inactivo con estilos por variante. |

### `components/ui/`

Primitivos de UI de shadcn/ui (`button.tsx`, `input.tsx`, `badge.tsx`, `dialog.tsx`, `sonner.tsx`, `table.tsx`). No se modifican directamente — se usan como base para los componentes de dominio.

---

## `app/` — Rutas y estructura Next.js

La carpeta `app/` sigue la convención App Router de Next.js 16. Usa route groups para separar la zona pública de la protegida.

### Archivos raíz

| Archivo | Qué hace |
|---------|----------|
| `layout.tsx` | Layout raíz. Aplica fuentes, el provider de tema (dark/light) y el `<Toaster>` de Sonner. |
| `page.tsx` | Raíz del sitio (`/`). Redirige inmediatamente a `/dashboard`. |
| `providers.tsx` | Client Component que envuelve la app con `ThemeProvider` de `next-themes`. |
| `globals.css` | Estilos globales + configuración del tema via `@theme` de Tailwind v4. |

### `app/(auth)/` — Zona pública

Layout mínimo sin sidebar. Accesible sin sesión.

```
(auth)/
  layout.tsx       → layout centrado, sin sidebar ni header
  login/page.tsx   → renderiza <LoginForm />
```

### `app/(admin)/` — Zona protegida

El `layout.tsx` llama a `requireSession()` al inicio — si no hay token, redirige a `/login`. Monta `<SidebarClient>` y `<HeaderClient>` como estructura permanente.

Cada sección sigue el mismo patrón:
- `page.tsx` (Server Component) → fetch de datos → pasa props al componente de tabla o vista
- `loading.tsx` → skeleton para el estado de carga
- `error.tsx` (donde existe) → boundary de error con botón "Reintentar"
- `[id]/page.tsx` → detalle/edición del registro
- `new/page.tsx` → formulario de creación

| Ruta | Descripción |
|------|-------------|
| `dashboard/` | Dashboard con widgets de analytics (órdenes, top productos, stock crítico) |
| `catalog/products/` | Listado, creación y edición de productos. Subruta `[id]/images/` para gestionar imágenes con `ProductImagesClient.tsx` |
| `catalog/combos/` | Listado, creación y edición de combos. Subruta `[id]/images/` para imágenes con `ComboImagesClient.tsx` |
| `catalog/categories/` | Listado, creación y edición de categorías |
| `catalog/error.tsx` | Error boundary compartido para toda la sección de catálogo |
| `orders/` | Listado de órdenes con filtros. Subruta `[id]/` para ver detalle y cambiar estado con `OrderStatusClient.tsx` |
| `pricing/margins/` | CRUD de márgenes con `MarginsClient.tsx` |
| `pricing/products/` | Tabla de precios por producto y moneda con `ProductPricingClient.tsx` |
| `pricing/combos/` | Tabla de precios por combo y moneda con `ComboPricingClient.tsx` |
| `taxes/` | Listado de tipos de impuesto con `TaxTypesClient.tsx`. Subruta `[typeId]/` para ver y agregar tasas con `TaxRatesClient.tsx` |
| `stock/items/` | Listado de ítems de stock. Subruta `[id]/` con operaciones (agregar, dar de baja, umbrales) en `StockItemClient.tsx`. Subruta `new/` para crear ítem |
| `stock/locations/` | Gestión de ubicaciones físicas con `LocationsClient.tsx` |
| `stock/movements/` | Historial de movimientos (solo lectura) con filtros en `MovementsFilter.tsx` |
| `stock/write-offs/` | Historial de bajas con filtros en `WriteOffsFilter.tsx` |
| `promotions/coupons/` | Listado y creación de cupones. Subruta `[id]/` con gestión de targets en `CouponTargetsClient.tsx` |
| `promotions/discounts/` | Listado y creación de descuentos. Subruta `[id]/` con gestión de targets en `DiscountDetailClient.tsx` |
| `users/` | Listado de usuarios con búsqueda en `UsersSearchClient.tsx`. Subruta `[id]/` para ver detalle |

### `app/api/` — Route Handlers (BFF proxy)

Endpoints internos de Next.js que actúan como proxy hacia waiona-core. Los Client Components que necesitan hacer fetch usan estas rutas en lugar de llamar a waiona-core directamente.

| Ruta | Método | Qué hace |
|------|--------|----------|
| `api/auth/route.ts` | `POST` | Proxy para `/auth/login` — usado por `LoginForm` si necesita autenticarse vía fetch en lugar de Server Action |
| `api/analytics/route.ts` | `GET` | Proxy para los tres endpoints de analytics (`?type=orders`, `?type=top-products`, `?type=critical-stock`) |
| `api/pricing/preview/route.ts` | `POST` | Proxy para `/pricing/calculate/preview` — calcula precio final con margen aplicado, usado en formularios de pricing para mostrar preview en tiempo real |

---

## Flujo general de datos

```
Usuario (browser)
  │
  ├── Navegación normal
  │     → page.tsx (Server Component)
  │         → lib/api.ts → waiona-core
  │         → Pasa datos como props al componente de UI
  │
  ├── Mutación (form submit)
  │     → actions/*.ts (Server Action)
  │         → lib/api.ts → waiona-core
  │         → revalidateTag / redirect
  │
  └── Client Component que necesita fetch
        → fetch('/api/resource') (Route Handler)
            → lib/api.ts → waiona-core
```
