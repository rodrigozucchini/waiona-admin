# Waiona Admin — Plan de Implementación

Panel de administración completo sobre **waiona-core** (NestJS 11, ~158 endpoints).
Stack: Next.js 16.2.6 · React 19.2.4 · App Router · Tailwind v4 · TypeScript.

---

## Estructura de carpetas objetivo

```
waiona-admin/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                  # Sidebar + header + auth check
│   │   ├── dashboard/page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── catalog/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── images/page.tsx
│   │   │   ├── combos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── images/page.tsx
│   │   │   └── categories/page.tsx
│   │   ├── pricing/
│   │   │   ├── margins/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   └── combos/page.tsx
│   │   ├── taxes/
│   │   │   ├── page.tsx
│   │   │   └── [typeId]/page.tsx
│   │   ├── stock/
│   │   │   ├── items/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── locations/page.tsx
│   │   │   ├── movements/page.tsx
│   │   │   └── write-offs/page.tsx
│   │   ├── promotions/
│   │   │   ├── coupons/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── discounts/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── api/                            # Route Handlers (BFF proxy)
│   │   ├── auth/route.ts
│   │   ├── users/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── ...                         # Un route handler por recurso
│   └── globals.css
├── actions/                            # Server Actions por módulo
│   ├── auth.ts
│   ├── products.ts
│   ├── combos.ts
│   ├── categories.ts
│   ├── stock.ts
│   ├── pricing.ts
│   ├── taxes.ts
│   ├── promotions.ts
│   └── orders.ts
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   ├── layout/
│   │   ├── SidebarClient.tsx           # 'use client' — collapsed state
│   │   └── HeaderClient.tsx
│   ├── tables/
│   │   ├── DataTable.tsx               # 'use client' — sorting UI
│   │   └── Pagination.tsx              # 'use client'
│   ├── forms/
│   │   ├── ProductForm.tsx             # 'use client'
│   │   ├── ComboForm.tsx
│   │   └── ...
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx           # 'use client'
│       └── ImageUploader.tsx           # 'use client'
├── lib/
│   ├── api.ts                          # API client server-side
│   ├── auth.ts                         # Session helpers
│   └── utils.ts
├── types/
│   └── index.ts                        # Todos los tipos de la API
├── middleware.ts                        # Protección de rutas admin
└── agents/                             # Skills para Claude Code
```

---

## Fases de implementación

### Fase 0 — Fundación *(prerequisito de todo)*

**Objetivo:** Base técnica sólida antes de implementar cualquier feature.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 0.1 | `types/index.ts` | Todos los tipos TypeScript derivados de la API |
| 0.2 | `lib/api.ts` | Cliente HTTP server-side con manejo de auth y errores |
| 0.3 | `.env.local` | Variables de entorno (`API_URL`, `API_TOKEN`, `JWT_SECRET`) |
| 0.4 | `globals.css` | Setup de Tailwind v4 con `@import "tailwindcss"` y tokens de diseño |
| 0.5 | UI primitives | Instalar y configurar shadcn/ui (Button, Input, Table, Dialog, Badge, Toast) |
| 0.6 | `lib/utils.ts` | Helpers: formatDate, formatCurrency, formatEnum, cn() |

**Tipos clave a definir:**
```typescript
// Paginación
PaginatedResponse<T>
PaginationQuery

// Auth
AuthTokens, LoginDto, JWTPayload

// Enums
RoleType, OrderStatus, PaymentStatus, DeliveryType
StockFlowType, StockOperationType, StockWriteoffReason
CurrencyCode, ProductMeasurementUnit

// Entidades (una por módulo)
User, Profile, Product, Combo, Category
StockItem, StockLocation, StockMovement, StockWriteOff
ProductPricing, ComboPricing, Margin
TaxType, Tax, Coupon, Discount, Order, Payment
```

---

### Fase 1 — Autenticación *(bloquea todo lo demás)*

**Objetivo:** Login funcional, tokens en httpOnly cookie, rutas protegidas.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 1.1 | `middleware.ts` | Verifica cookie de sesión, redirige a `/login` si no existe |
| 1.2 | `app/(auth)/login/page.tsx` | Formulario de login (Server Component) |
| 1.3 | `app/(auth)/layout.tsx` | Layout mínimo sin sidebar |
| 1.4 | `actions/auth.ts` | Server Action: login, logout, refresh |
| 1.5 | `lib/auth.ts` | getSession(), setTokenCookie(), clearTokenCookie() |
| 1.6 | `app/api/auth/route.ts` | Proxy hacia `POST /auth/login` |

**Flujo:**
```
Login form → Server Action → POST /api/auth → waiona-core /auth/login
→ Guardar access_token en httpOnly cookie → redirect('/dashboard')
```

**Decisión de diseño:** Los tokens se guardan en cookies httpOnly (no localStorage), el refresh se maneja en middleware.

---

### Fase 2 — Shell del admin *(layout, sidebar, dashboard)*

**Objetivo:** Estructura visual del panel con datos reales de analytics.

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| 2.1 | `app/(admin)/layout.tsx` | Server Component: verifica sesión, renderiza shell |
| 2.2 | `components/layout/SidebarClient.tsx` | Sidebar colapsable con navegación por módulos |
| 2.3 | `components/layout/HeaderClient.tsx` | Header con usuario activo + logout |
| 2.4 | `app/(admin)/dashboard/page.tsx` | Métricas: órdenes, ingresos, top productos, stock crítico |
| 2.5 | `app/(admin)/dashboard/loading.tsx` | Skeleton del dashboard |
| 2.6 | `app/api/analytics/route.ts` | Proxy hacia los 3 endpoints de analytics |

**Endpoints usados:**
- `GET /analytics/orders` — resumen por estado + revenue
- `GET /analytics/products/top` — top 10 productos
- `GET /analytics/stock/critical` — items bajo umbral crítico

---

### Fase 3 — Catálogo *(productos, combos, categorías)*

**Objetivo:** CRUD completo del catálogo con upload de imágenes.

#### 3a — Categorías
| Tarea | Descripción |
|-------|-------------|
| `categories/page.tsx` | Vista árbol jerárquico + tabla plana |
| `actions/categories.ts` | create, update, softDelete |
| `app/api/categories/route.ts` | Proxy CRUD + tree endpoint |

#### 3b — Productos
| Tarea | Descripción |
|-------|-------------|
| `products/page.tsx` | Lista paginada con filtros por categoría/estado |
| `products/new/page.tsx` | Formulario de creación |
| `products/[id]/page.tsx` | Formulario de edición |
| `products/[id]/images/page.tsx` | Gestión de imágenes (upload + reorder) |
| `actions/products.ts` | create, update, delete, assignTax |
| `components/forms/ProductForm.tsx` | Formulario con validación client-side |
| `components/shared/ImageUploader.tsx` | Drag & drop upload multipart |

#### 3c — Combos
| Tarea | Descripción |
|-------|-------------|
| `combos/page.tsx` | Lista paginada |
| `combos/[id]/page.tsx` | Formulario con items dinámicos (agregar/quitar productos) |
| `combos/[id]/images/page.tsx` | Gestión de imágenes |
| `actions/combos.ts` | CRUD + imagen |

---

### Fase 4 — Precios e Impuestos

**Objetivo:** Configurar márgenes, precios y estructura impositiva.

| Tarea | Descripción |
|-------|-------------|
| `pricing/margins/page.tsx` | CRUD de márgenes (porcentaje) |
| `pricing/products/page.tsx` | Tabla de precios por producto + moneda |
| `pricing/combos/page.tsx` | Tabla de precios por combo |
| `taxes/page.tsx` | Lista de tipos de impuesto |
| `taxes/[typeId]/page.tsx` | Impuestos dentro del tipo + asignación a productos/combos |
| `actions/pricing.ts` | createMargin, updatePricing, assignTax, removeTax |

**Complejidad:** Los precios son calculados (`baseCost + margin%`), el admin configura el costo base y el margen, la API devuelve el `finalPrice`. Mostrar el cálculo en tiempo real en el formulario.

---

### Fase 5 — Inventario / Stock

**Objetivo:** Control completo de stock con operaciones y auditoría.

| Tarea | Descripción |
|-------|-------------|
| `stock/locations/page.tsx` | CRUD de ubicaciones (warehouse/store) |
| `stock/items/page.tsx` | Lista de stock con alertas de umbral |
| `stock/items/[id]/page.tsx` | Detalle: historial de movimientos + write-offs |
| `stock/movements/page.tsx` | Auditoría de todos los movimientos |
| `stock/write-offs/page.tsx` | Bajas con razón y notas |
| `actions/stock.ts` | addStock, writeOff, writeOffDamage, dispatch, release, updateThresholds |
| `components/stock/StockOperationPanel.tsx` | Panel de operaciones con confirmación |

**Operaciones críticas** (requieren `ConfirmDialog`):
- `write-off`: merma permanente
- `write-off-damage`: baja por daño
- `dispatch`: reserva para orden

---

### Fase 6 — Promociones

**Objetivo:** Gestión de cupones y descuentos con asignación de targets.

| Tarea | Descripción |
|-------|-------------|
| `promotions/coupons/page.tsx` | Lista de cupones con estado activo/vencido |
| `promotions/coupons/[id]/page.tsx` | Edición + asignación de productos/combos target |
| `promotions/discounts/page.tsx` | Lista de descuentos |
| `promotions/discounts/[id]/page.tsx` | Edición + targets |
| `actions/promotions.ts` | CRUD coupons, CRUD discounts, assignTarget, removeTarget |

**Lógica especial:** Un cupón puede tener targets vacíos (aplica a todo) o targets específicos. Mostrar este comportamiento claramente en la UI.

---

### Fase 7 — Órdenes y Pagos

**Objetivo:** Monitoreo y gestión del estado de órdenes.

| Tarea | Descripción |
|-------|-------------|
| `orders/page.tsx` | Lista filtrable por status, fecha, usuario |
| `orders/[id]/page.tsx` | Detalle completo: items, pagos, historial |
| `actions/orders.ts` | updateOrderStatus |
| `app/api/orders/route.ts` | Proxy con query params |

**Estados de orden (flujo):**
```
pending → confirmed → shipped → delivered
                    ↘ cancelled (desde cualquier estado)
```

---

### Fase 8 — Usuarios

**Objetivo:** Listado y consulta de usuarios registrados.

| Tarea | Descripción |
|-------|-------------|
| `users/page.tsx` | Lista paginada con búsqueda |
| `users/[id]/page.tsx` | Perfil completo, órdenes del usuario, estado de cuenta |

---

### Fase 9 — Optimización y Polish

**Objetivo:** Performance, UX y seguridad de producción.

| Área | Tareas |
|------|--------|
| **Caché** | `unstable_cache` en listados poco volátiles (categorías, locations, tax types) |
| **Revalidación** | Tags de caché por módulo — `revalidateTag('products')` en cada mutación |
| **Bundle** | Analizar con `@next/bundle-analyzer`, asegurar que Server Components no importen librerías de cliente |
| **Imágenes** | `next/image` + dominios Cloudinary configurados en `next.config.ts` |
| **Skeleton UI** | `loading.tsx` con skeletons para todas las páginas de listado |
| **Error boundaries** | `error.tsx` en cada sección del admin |
| **Toast system** | Feedback consistente post-mutación en toda la app |
| **Empty states** | Pantallas de estado vacío para todas las tablas |
| **Accesibilidad** | Labels ARIA en formularios, focus management en modales |
| **Rate limit UX** | Manejo visual del 429 — backoff con mensaje amigable |

---

## Decisiones técnicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| UI Components | shadcn/ui | Sin bundle client overhead, composable, Tailwind v4 compatible |
| Charts | Recharts | Ligero, SSR-compatible, suficiente para el dashboard |
| Tablas | TanStack Table | Server-side pagination, sorting nativo |
| Forms | React Hook Form + Zod | Validación con schema, integra con useActionState |
| Toast | sonner | Minimal, funciona con App Router |
| Date picker | react-day-picker | Ligero, sin deps pesadas |
| Image upload | Custom (multipart fetch) | La API maneja Cloudinary directamente |

---

## Mapa de dependencias entre fases

```
Fase 0 (Tipos + API Client)
    └── Fase 1 (Auth)
            └── Fase 2 (Shell + Dashboard)
                    ├── Fase 3 (Catálogo)
                    │       └── Fase 4 (Precios)
                    │               └── Fase 6 (Promociones)
                    ├── Fase 5 (Stock) — independiente del catálogo
                    └── Fase 7 (Órdenes)
                            └── Fase 8 (Usuarios)
                                        └── Fase 9 (Optimización)
```

---

## Checklist de entregables por fase

### Fase 0
- [ ] `types/index.ts` con todos los tipos de la API
- [ ] `lib/api.ts` funcional
- [ ] Variables de entorno documentadas
- [ ] shadcn/ui configurado
- [ ] Tailwind v4 setup completo

### Fase 1
- [ ] Login funcional con token en httpOnly cookie
- [ ] Middleware protegiendo rutas `/admin/*`
- [ ] Logout funcional
- [ ] Redirect a dashboard post-login

### Fase 2
- [ ] Layout con sidebar navegable
- [ ] Dashboard con 3 widgets de analytics
- [ ] Loading skeletons

### Fase 3
- [ ] CRUD Categorías (árbol + lista)
- [ ] CRUD Productos con paginación
- [ ] Upload y gestión de imágenes
- [ ] CRUD Combos con items dinámicos

### Fase 4
- [ ] CRUD Márgenes
- [ ] Precios de productos por moneda
- [ ] Precios de combos
- [ ] Tipos de impuesto + impuestos
- [ ] Asignación de impuestos a productos/combos

### Fase 5
- [ ] CRUD Ubicaciones
- [ ] Lista de stock con alertas visuales
- [ ] Operaciones de stock con confirmación
- [ ] Historial de movimientos
- [ ] Write-offs

### Fase 6
- [ ] CRUD Cupones con date range y targets
- [ ] CRUD Descuentos con targets
- [ ] Vista de uso de cupones

### Fase 7
- [ ] Lista de órdenes con filtros
- [ ] Detalle de orden con línea de tiempo de estado
- [ ] Cambio de estado de orden

### Fase 8
- [ ] Lista de usuarios
- [ ] Perfil de usuario con historial de órdenes

### Fase 9
- [ ] Bundle analysis limpio (< 200kb first load)
- [ ] Caché configurado por módulo
- [ ] Todos los `loading.tsx` y `error.tsx` implementados
- [ ] Toast feedback en todas las mutaciones
