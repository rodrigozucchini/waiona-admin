# Waiona Core — Referencia de API para Frontend

**Última actualización:** 2026-07-26
**Alcance:** documento de referencia completo de todos los endpoints, DTOs y enums de la API para el equipo de frontend. Generado a partir del código fuente real (controllers, DTOs, entidades) de `waiona-core`.

---

## 0. Cómo usar este documento

Cada endpoint se documenta con:
- **Método + ruta completa** (incluye el prefijo de versión `/v1`).
- **Auth**: si requiere JWT y qué rol(es).
- **Body / Query** con cada campo, tipo, si es opcional y sus validaciones.
- **Respuesta** (shape del objeto que devuelve).

Además hay Swagger interactivo corriendo en el propio backend en **`/api/docs`** — sirve para probar requests reales, pero este documento tiene más contexto de negocio (por qué un campo es opcional, qué reglas de transición existen, etc.) que Swagger no muestra.

---

## 1. Información general

### 1.1 Base URL y versionado

Todas las rutas están prefijadas con `/v1` (versionado por URI, `VersioningType.URI` de NestJS, declarado por controller con `@Controller({ version: '1', path: '...' })`).

```
https://<host>/v1/<recurso>
```

Ejemplo: `POST https://api.waiona.com/v1/auth/login`

### 1.2 Documentación interactiva

Swagger UI: **`GET /api/docs`** (sin prefijo de versión, es la única ruta que no lo lleva junto con el health check).

### 1.3 Formato de error (global)

Todos los errores 4xx/5xx devuelven el mismo shape JSON, generado por un `GlobalExceptionFilter` central:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "El email ya está en uso",
  "timestamp": "2026-07-26T14:32:10.123Z",
  "path": "/v1/users"
}
```

- `message` puede ser un `string` **o un array de strings** (cuando `class-validator` rechaza varios campos a la vez — es el caso típico de un 400 por body inválido).
- `error` es el nombre HTTP status (`"Bad Request"`, `"Not Found"`, `"Conflict"`, etc.).
- Los 500 no filtran detalles internos — siempre devuelven `"Internal server error"` como mensaje (el detalle real solo queda logueado server-side).

### 1.4 Paginación

Patrón reutilizado en casi todos los `GET` de listado. Query params:

| Param | Tipo | Default | Límites |
|---|---|---|---|
| `page` | number | 1 | mínimo 1 |
| `limit` | number | 20 | mínimo 1, **máximo 100** |

Response shape (`PaginatedResponseDto<T>`):

```json
{
  "data": [ /* array de T */ ],
  "total": 137,
  "page": 1,
  "limit": 20,
  "totalPages": 7,
  "hasNextPage": true
}
```

### 1.5 Rate limiting (Throttler)

Límite global por defecto: **30 requests / 60s** por cliente. Algunos endpoints sensibles tienen límites más estrictos (se indican en cada sección):

| Endpoint | Límite |
|---|---|
| `POST /v1/auth/register` | 5 / 60s |
| `POST /v1/auth/login` | 5 / 60s |
| `POST /v1/auth/forgot-password` | 3 / 60s |
| `POST /v1/auth/reset-password` | 5 / 60s |
| `POST /v1/orders` | 5 / 60s |
| `POST /v1/payments/webhook/mercadopago` | sin límite (`@SkipThrottle`, MercadoPago reintenta agresivamente) |

Al superar el límite, la API devuelve **429 Too Many Requests**.

### 1.6 CORS

Habilitado solo para el origin configurado en `FRONTEND_URL` (variable de entorno del backend), con `credentials: true`. Si el frontend corre en otro dominio/puerto no configurado ahí, todas las requests van a fallar por CORS — avisar al equipo de backend si hace falta agregar un origin nuevo (ej. preview deploys).

### 1.7 Convenciones de payload que afectan al frontend

- **Normalización automática de strings**: varios campos de texto se transforman en el backend antes de guardar (no hace falta que el frontend los normalice, pero sí hay que saber que el valor que vuelve en la respuesta puede no ser idéntico al que se mandó):
  - Identificadores de negocio (`name`, `sku`, `code`) → se guardan en **MAYÚSCULAS** y sin espacios extra (`.toUpperCase().trim()`).
  - Texto libre (`description`, `address`, `notes`) → solo `.trim()`, se preserva el case.
- **`forbidNonWhitelisted: true`**: cualquier campo extra en el body que no esté en el DTO devuelve **400**. No mandar campos "por las dudas".
- **Números en query params**: se transforman automáticamente (`@Type(() => Number)`), pero deben llegar como strings numéricos válidos en la URL (`?page=2&limit=10`).
- **Soft delete**: casi todas las entidades se borran con soft-delete (`deletedAt`). Un recurso "eliminado" deja de aparecer en cualquier `GET`, pero devuelve **404** si se pide por ID directamente después de borrado.

---

## 2. Autenticación y autorización

### 2.1 Roles

```ts
enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CLIENT = 'client',
}
```

`CLIENT` se asigna automáticamente al registrarse. `ADMIN`/`SUPER_ADMIN` se asignan manualmente en base de datos (no hay endpoint público para asignarse un rol admin).

### 2.2 JWT

- Header requerido en endpoints protegidos: `Authorization: Bearer <access_token>`
- **Access token**: expira en **15 minutos**. Payload: `{ sub: number (userId), role: RoleType | null }`.
- **Refresh token**: opaco (no es JWT), expira en **30 días**, se guarda hasheado (SHA-256) en el backend. Se rota en cada uso — **cada llamada a `/auth/refresh` invalida el refresh token usado y devuelve uno nuevo**. El frontend debe reemplazar el refresh token guardado en cada refresh, nunca reutilizar uno viejo.
- Si un endpoint protegido devuelve 401 con access token expirado, el frontend debe llamar a `/auth/refresh` con el refresh token vigente y reintentar. Si el refresh también falla (401), forzar logout/login.

### 2.3 Endpoints de Auth (`/v1/auth`)

#### `POST /v1/auth/register`
Auth: ninguna. Rate limit: 5/60s.

Body (`CreateUserDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `email` | string | sí | `@IsEmail` |
| `password` | string | sí | 8–255 chars, debe tener al menos 1 mayúscula, 1 minúscula, 1 número |
| `name` | string | sí | 1–255 chars |
| `lastName` | string | sí | 1–255 chars |
| `avatar` | string (URL) | no | `@IsUrl`, máx 255 chars |

Respuesta `201`: `{ "message": "Registration successful — check your email to activate your account" }`
El usuario queda `isActive: false` hasta activar por email. Errores: `400` datos inválidos, `409` email ya existe.

#### `GET /v1/auth/activate?token=<token>`
Auth: ninguna.

Activa la cuenta con el token recibido por email (token de 24h, uso único). Respuesta `200`: `{ "message": "Account activated successfully" }`. `400` si el token es inválido, expirado o ya usado, o si la cuenta ya estaba activa.

#### `POST /v1/auth/login`
Auth: ninguna. Rate limit: 5/60s.

Body: `{ "email": string, "password": string }`

Respuesta `200`:
```json
{
  "user": { "id": 1, "email": "...", "isActive": true, "role": "client", "profile": { "id": 1, "name": "...", "lastName": "...", "avatar": null }, "createdAt": "...", "updatedAt": "..." },
  "access_token": "eyJ...",
  "refresh_token": "a1b2c3..."
}
```
`401` si credenciales inválidas **o** si la cuenta no está activada (mismo mensaje genérico por seguridad, no distingue el caso).

#### `POST /v1/auth/refresh`
Auth: ninguna (usa el refresh token en el body, no el header).

Body: `{ "refresh_token": string }`

Respuesta `200`: `{ "access_token": string, "refresh_token": string }` — **el refresh_token es nuevo, reemplazar el guardado**. `401` si el token es inválido, expiró o ya fue revocado/usado.

#### `POST /v1/auth/logout`
Auth: ninguna (revoca por el token en el body, no requiere estar autenticado con access token).

Body: `{ "refresh_token": string }` → `204 No Content`. Revoca ese refresh token puntual (logout de un solo dispositivo).

#### `POST /v1/auth/logout-all`
Auth: **JWT requerido**.

Sin body → `204 No Content`. Revoca **todos** los refresh tokens activos del usuario (cierra sesión en todos los dispositivos).

#### `PATCH /v1/auth/change-password`
Auth: **JWT requerido**.

Body (`ChangePasswordDto`):

| Campo | Tipo | Validación |
|---|---|---|
| `currentPassword` | string | requerido |
| `newPassword` | string | 8–100 chars, 1 mayúscula + 1 minúscula + 1 número |

Respuesta `200`: `{ "message": "Password changed successfully" }`. `400` si la contraseña actual es incorrecta.

#### `POST /v1/auth/forgot-password`
Auth: ninguna. Rate limit: 3/60s.

Body: `{ "email": string }` → siempre `200 OK` con `{ "message": "If the email exists, you will receive a reset link shortly" }`, **sin importar si el email existe o no** (por diseño, para no filtrar qué emails están registrados).

#### `POST /v1/auth/reset-password`
Auth: ninguna. Rate limit: 5/60s.

Body:

| Campo | Tipo | Validación |
|---|---|---|
| `token` | string | requerido (token de 1h recibido por email) |
| `password` | string | 8–100 chars, 1 mayúscula + 1 minúscula + 1 número |

Respuesta `200`: `{ "message": "Password reset successfully" }`. `400` si el token es inválido/expirado/usado.

### 2.4 Errores de autorización

- **401 Unauthorized**: no autenticado (falta el header, token inválido o expirado).
- **403 Forbidden**: autenticado pero sin el rol requerido, o intentando acceder/modificar un recurso de otro usuario (por ejemplo `GET /v1/users/:id` con un `id` que no es el propio).

---

## 3. Usuarios (`/v1/users`)

Todos requieren JWT. `ApiBearerAuth` a nivel de controller.

#### `GET /v1/users`
Auth: JWT + rol `SUPER_ADMIN` o `ADMIN`.

Query (`SearchUsersDto`, extiende paginación):

| Campo | Tipo | Notas |
|---|---|---|
| `page`, `limit` | number | paginación estándar |
| `email` | string | búsqueda parcial (`ILIKE`) |
| `name` | string | busca por nombre **o** apellido |

Respuesta: `PaginatedResponseDto<UserResponseDto>`.

#### `GET /v1/users/:id`
Auth: JWT. **Solo el propio usuario** puede pedir su recurso (`403` si `id` no coincide con el `sub` del JWT — no hay excepción para admins en este endpoint puntual).

#### `PATCH /v1/users/:id`
Auth: JWT, solo el propio usuario.

Body (`UpdateUserDto` — todos opcionales, es `CreateUserDto` sin `email`/`password`):

| Campo | Tipo |
|---|---|
| `name` | string, opcional |
| `lastName` | string, opcional |
| `avatar` | string (URL), opcional |

No permite cambiar email ni password desde este endpoint (password se cambia por `/auth/change-password`).

#### `DELETE /v1/users/:id`
Auth: JWT, solo el propio usuario. Soft delete. `204`.
`409 Conflict` si el usuario tiene órdenes activas (`PENDING`, `CONFIRMED` o `DISPATCHED`) — no se puede borrar la cuenta hasta que esas órdenes se completen/cancelen.

### `UserResponseDto` (shape completo)

```json
{
  "id": 1,
  "email": "juan@example.com",
  "isActive": true,
  "role": "client",
  "profile": { "id": 1, "name": "Juan", "lastName": "Pérez", "avatar": null },
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

## 4. Catálogo — Categorías (`/v1/categories`)

Todos: Auth JWT + rol `SUPER_ADMIN`/`ADMIN`. (El árbol público sin auth vive en `/v1/shop/categories`, ver sección 6).

#### `GET /v1/categories` — paginado (plano, sin jerarquía)
#### `GET /v1/categories/tree` — árbol completo jerárquico

Respuesta (`CategoryTreeResponseDto[]`, recursivo):
```json
[{ "id": 1, "name": "BEBIDAS", "children": [{ "id": 2, "name": "GASEOSAS", "children": [] }] }]
```

#### `GET /v1/categories/:id`
#### `POST /v1/categories`

Body (`CreateCategoryDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `name` | string | sí | 2–100 chars, se guarda en MAYÚSCULAS |
| `description` | string | no | 5–255 chars |
| `parentId` | number \| null | no | `>= 1` si se manda (para subcategorías) |

`400` si `parentId` no existe.

#### `PATCH /v1/categories/:id` — mismo shape, todo opcional
#### `DELETE /v1/categories/:id` — soft delete, `204`

`409 Conflict` si la categoría tiene subcategorías, productos o combos activos asignados.

### `CategoryResponseDto`
```json
{ "id": 1, "name": "BEBIDAS", "description": "Bebidas en general", "isActive": true, "parentId": null, "createdAt": "...", "updatedAt": "..." }
```

---

## 5. Catálogo — Productos, Combos e Imágenes

### 5.1 Productos (`/v1/products`)

Todos: Auth JWT + rol `SUPER_ADMIN`/`ADMIN`.

#### `GET /v1/products` — paginado
#### `GET /v1/products/:id`
#### `POST /v1/products`

Body (`CreateProductDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `sku` | string | sí | 3–50 chars, único, se guarda en MAYÚSCULAS |
| `name` | string | sí | 2–150 chars, MAYÚSCULAS |
| `description` | string | sí | 5–255 chars |
| `isActive` | boolean | no | default `true` |
| `categoryId` | number | sí | `>= 1`, debe existir |
| `measurementUnit` | enum `ProductMeasurementUnit` | sí | ver abajo |
| `measurementValue` | number | no | `>= 0`, ej. `500` si es `GRAM` |

```ts
enum ProductMeasurementUnit {
  UNIT = 'unit', KG = 'kg', GRAM = 'gram', LITER = 'liter',
  ML = 'ml', METER = 'meter', CM = 'cm', PACK = 'pack',
  BOX = 'box', DOZEN = 'dozen',
}
```

`409` si el SKU ya existe.

#### `PATCH /v1/products/:id` — mismo shape, todo opcional
#### `DELETE /v1/products/:id` — soft delete, `204`

### `ProductResponseDto`
```json
{
  "id": 1, "sku": "CAFE-500G", "name": "CAFÉ TOSTADO", "description": "...",
  "isActive": true, "categoryId": 3, "categoryName": "ALMACÉN",
  "measurementUnit": "gram", "measurementValue": 500,
  "createdAt": "...", "updatedAt": "..."
}
```

### 5.2 Combos (`/v1/combos`)

Todos: Auth JWT + rol `SUPER_ADMIN`/`ADMIN`. Mismo patrón CRUD que productos.

Body (`CreateComboDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `name` | string | sí | 2–150 chars, MAYÚSCULAS |
| `description` | string | sí | 5–255 chars |
| `isActive` | boolean | no | default `true` |
| `categoryId` | number | sí | `>= 1` |
| `items` | `CreateComboItemDto[]` | sí | mínimo 1 item |

`CreateComboItemDto`: `{ productId: number (>=1), quantity: number (>=1) }`

`UpdateComboDto`: igual pero todo opcional (incluido `items`, que si se manda reemplaza la lista completa — no hay merge parcial de items).

### `ComboResponseDto`
```json
{
  "id": 1, "name": "COMBO FAMILIAR", "description": "...", "isActive": true,
  "categoryId": 2, "categoryName": "COMBOS",
  "items": [{ "productId": 1, "productName": "CAFÉ TOSTADO", "quantity": 2 }],
  "createdAt": "...", "updatedAt": "..."
}
```

### 5.3 Imágenes de producto (`/v1/product-images`) y de combo (`/v1/combo-images`)

Ambos módulos son **estructuralmente idénticos** (mismo patrón, solo cambia `productId`↔`comboId`). Auth: JWT + rol `SUPER_ADMIN`/`ADMIN`.

#### `POST /v1/product-images/upload` (o `/v1/combo-images/upload`)
`multipart/form-data`. Sube el archivo a Cloudinary.

| Campo (form-data) | Tipo | Notas |
|---|---|---|
| `file` | binary | máx **5 MB**, solo `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| `productId` (o `comboId`) | integer | requerido |
| `position` | integer | requerido, orden de la imagen |

`400` si el archivo no es del tipo permitido o falta. `404` si el producto/combo no existe.

#### `POST /v1/product-images` (URL externa manual, sin subir archivo)

| Campo | Tipo | Validación |
|---|---|---|
| `productId` | number | `>= 1` |
| `url` | string | 5–255 chars |
| `position` | number | `>= 1` |

#### `GET /v1/product-images/product/:productId` — lista imágenes de un producto
#### `GET /v1/product-images/:id`
#### `PATCH /v1/product-images/:id` — body: `{ position?: number }`
#### `DELETE /v1/product-images/:id` — soft delete, `204`

Response (`ProductImageResponseDto` / `ComboImageResponseDto`):
```json
{ "id": 1, "productId": 1, "url": "https://res.cloudinary.com/...", "position": 1, "createdAt": "...", "updatedAt": "..." }
```

---

## 6. Shop — catálogo público (`/v1/shop`)

**Sin autenticación.** Endpoints pensados para el frontend de cliente (listado y detalle de la tienda, ya con precio final calculado y stock).

#### `GET /v1/shop/categories`
Árbol de categorías activas. Respuesta: `CategoryTreeResponseDto[]` (mismo shape que sección 4).

⚠️ **Nota de estado real vs. documentado:** el `CLAUDE.md` del proyecto describe este endpoint como "cacheado con CacheInterceptor oficial". Al revisar el código fuente actual (`shop.controller.ts`, `shop.service.ts`, `shop.module.ts`) **no hay ningún `CacheInterceptor`/`@CacheTTL` activo en este endpoint** — sí existe un `CacheModule` global (Redis, TTL 60s) registrado en `app.module.ts`, pero no está enganchado acá. En la práctica, hoy **cada request a `/shop/categories` pega contra la DB**, sin cache HTTP de por medio. Si el frontend diseñó algo asumiendo una capa de cache del backend (ej. esperando datos "stale" por hasta 60s), confirmarlo con el equipo de backend antes de depender de eso.

#### `GET /v1/shop/items`
Búsqueda/listado del catálogo (productos y combos mezclados).

Query (`SearchShopDto`):

| Campo | Tipo | Notas |
|---|---|---|
| `search` | string | 1–100 chars, texto libre |
| `categoryId` | number | filtra por categoría |
| `type` | `'product' \| 'combo'` | filtra por tipo |
| `minPrice` / `maxPrice` | number | `>= 0`, hasta 2 decimales |
| `page`, `limit` | number | paginación estándar (default 1/20) |

Respuesta (`ShopPaginatedResponseDto`):
```json
{
  "total": 42, "page": 1, "limit": 20, "totalPages": 3, "hasNextPage": true,
  "data": [
    {
      "id": 1, "name": "CAFÉ TOSTADO", "type": "product",
      "originalPrice": 750, "finalPrice": 680, "discountAmount": 70,
      "hasDiscount": true, "inStock": true, "quantityAvailable": 42,
      "category": "ALMACÉN", "image": "https://res.cloudinary.com/..."
    }
  ]
}
```

#### `GET /v1/shop/items/:id?type=product|combo`
Detalle de un producto o combo específico. **`type` es requerido como query param** (`400` si falta).

Respuesta (`ShopDetailResponseDto`):
```json
{
  "id": 1, "name": "CAFÉ TOSTADO", "description": "...", "type": "product",
  "originalPrice": 750, "finalPrice": 680, "discountAmount": 70,
  "priceAfterDiscount": 680, "taxes": 118, "hasDiscount": true,
  "inStock": true, "quantityAvailable": 42,
  "stockStatus": "available",
  "category": "ALMACÉN",
  "images": ["https://res.cloudinary.com/img1.jpg", "https://res.cloudinary.com/img2.jpg"],
  "items": null
}
```
- `stockStatus`: `'available' | 'low' | 'critical' | 'out_of_stock'`.
- `items` solo viene poblado (`ComboItemShopDto[]`) cuando `type=combo`: `{ productId, productName, quantity }`.
- `404` si el ítem no existe o no tiene pricing configurado (sin pricing, no se puede calcular precio → no es "visible" en la tienda).

---

## 7. Pricing (`/v1/product-pricing`, `/v1/combo-pricing`, `/v1/pricing/calculate`)

Todos requieren Auth JWT + rol `SUPER_ADMIN`/`ADMIN` (excepto `pricing/calculate/product` y `/combo`, que también aceptan `CLIENT` — pensado para que el frontend del shop pueda recalcular precios on-demand).

### 7.1 Enum de moneda

```ts
enum CurrencyCode {
  ARS = 'ARS', // única soportada actualmente
}
```

### 7.2 `/v1/product-pricing` y `/v1/combo-pricing`

Mismo patrón CRUD para ambos (cambia `productId`↔`comboId`):

- `POST /` — crear pricing. Body: `{ productId: number, currency: CurrencyCode, unitPrice: number (>=0.01, 2 decimales), salePrice: number (>=0.01, 2 decimales) }`. `400` si el producto ya tiene pricing (relación 1:1). `404` si el producto no existe.
- `GET /` — paginado.
- `GET /product/:productId` (o `/combo/:comboId`) — pricing por el id del producto/combo.
- `GET /:id` — por id del pricing.
- `PATCH /:id` — actualizar (sin `productId`), todo opcional.
- `DELETE /:id` — soft delete, `204`.

Response:
```json
{ "id": 1, "productId": 1, "currency": "ARS", "unitPrice": 500, "salePrice": 750, "createdAt": "...", "updatedAt": "..." }
```

`unitPrice` = costo (informativo/interno), `salePrice` = precio de venta cargado directamente por el admin. **`salePrice` no se calcula a partir de `unitPrice` + margen — son dos campos independientes.**

### 7.3 Motor de cálculo (`/v1/pricing/calculate`)

Es el endpoint clave para entender cómo se arma el precio final que ve el cliente.

#### `POST /v1/pricing/calculate/product`
Auth: JWT, roles `SUPER_ADMIN`, `ADMIN`, `CLIENT`.
Body: `{ productId: number (>=1) }` → calcula usando el pricing/descuentos/impuestos ya cargados en DB para ese producto. `404` si no tiene pricing configurado.

#### `POST /v1/pricing/calculate/combo`
Igual pero con `{ comboId: number }`. `404` si el combo o algún producto del combo no tiene pricing.

#### `POST /v1/pricing/calculate/preview`
Auth: JWT, solo `SUPER_ADMIN`/`ADMIN`. **No toca la base de datos** — sirve para simular un cálculo con valores manuales (útil para un formulario de "previsualizar precio" en el admin antes de guardar).

Body (`CalculatePreviewDto`):

| Campo | Tipo | Notas |
|---|---|---|
| `unitPrice` | number | `>= 0` |
| `salePrice` | number | `>= 0.01` |
| `discountValue` | number | opcional, `0.01`–`100` (porcentaje) |
| `taxes` | `{ value: number (0.01–100) }[]` | opcional, array de porcentajes |
| `couponValue` | number | opcional, `0.01`–`100` (porcentaje) |

Los 3 endpoints devuelven el mismo shape (`PriceBreakdownDto`) — **este es el desglose completo que hay que mostrar en el frontend para cualquier pantalla de precio/checkout**:

```json
{
  "unitPrice": 500,
  "salePrice": 750,
  "margin": 250,
  "discount": 75,
  "priceAfterDiscount": 675,
  "taxes": 141.75,
  "finalPrice": 816.75,
  "fullPrice": 907.5,
  "coupon": 81.68,
  "orderTotal": 735.08
}
```

⚠️ **Importante:** el ejemplo de arriba (con `coupon` no nulo) solo puede darse en `/preview` mandando `couponValue`. En `/product` y `/combo`, **`coupon` siempre viene en `0` y `orderTotal === finalPrice`** — estos dos endpoints no aplican cupón. El cupón real de una compra se aplica en el flujo de `orders` (`couponCode` al crear la orden + `POST /coupon-usage`, ver secciones 10.3 y 12.2), no acá. Si se necesita mostrar "precio con cupón" antes de crear la orden, hay que usar `/preview` con los valores reales.

Orden del cálculo (importante para saber qué mostrar tachado vs. qué mostrar como precio final):
1. `salePrice` (precio de venta base)
2. − `discount` (descuento, % sobre `salePrice`) → `priceAfterDiscount`
3. + `taxes` (impuestos, % sobre `priceAfterDiscount`) → `finalPrice` ← **precio real sin cupón**
4. − `coupon` (cupón, aplicado post-impuestos) → `orderTotal` ← **lo que paga el cliente**
5. `fullPrice` = `salePrice` + impuestos calculados sobre `salePrice` sin descuento → usar para el precio tachado en el front.
6. `margin` = `salePrice - unitPrice`, puramente informativo (no afecta el cálculo).

---

## 8. Impuestos (`/v1/taxes`, `/v1/products/:productId/taxes`)

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` en ambos.

### 8.1 `/v1/taxes` — catálogo global de impuestos

CRUD estándar (`GET` paginado, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` soft).

Body (`CreateTaxDto`):

| Campo | Tipo | Validación |
|---|---|---|
| `code` | string | 2–20 chars, MAYÚSCULAS (ej. `"IVA"`) |
| `name` | string | 3–150 chars, MAYÚSCULAS |
| `value` | number | `0.01`–`100` (siempre porcentaje) |
| `isGlobal` | boolean | opcional, default `false` |

Response: `{ id, code, name, value, isGlobal, createdAt, updatedAt }`.

### 8.2 `/v1/products/:productId/taxes` — asignación de impuestos a un producto

Los combos **no** tienen asignación directa de impuestos — prorratean los impuestos de sus productos componentes (lógica interna del `CalculationService`, no hay endpoint propio para esto).

- `GET /` — paginado, impuestos asignados a ese producto.
- `GET /:id` — por id de la asignación.
- `POST /` — body: `{ taxId: number (>=1) }`. `400` si el impuesto no existe o es `isGlobal: true` (los globales se aplican automáticamente a todo, no se asignan por producto).
- `PATCH /:id`, `DELETE /:id` (soft, `204`).

Response (`ProductTaxResponseDto`):
```json
{ "id": 1, "productId": 5, "taxId": 2, "tax": { "id": 2, "code": "IVA", "name": "IVA", "value": 21, "isGlobal": false, "createdAt": "...", "updatedAt": "..." }, "createdAt": "...", "updatedAt": "..." }
```

---

## 9. Descuentos (`/v1/discounts`)

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` en todos los sub-módulos. **Los descuentos siempre son porcentuales** (no hay descuento fijo en moneda).

### 9.1 `/v1/discounts` — catálogo de descuentos

CRUD estándar. Body (`CreateDiscountDto`):

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | 3–100 chars, MAYÚSCULAS |
| `description` | string | opcional, 3–255 chars, MAYÚSCULAS |
| `value` | number | `0.01`–`100` (porcentaje) |

Response: `{ id, name, description, value, createdAt, updatedAt }`.

### 9.2 `/v1/discounts/:discountId/targets/products` y `/v1/discounts/:discountId/targets/combos`

Asignan un descuento a un producto o combo específico (relación 1 descuento : muchos productos/combos, pero **1 producto solo puede tener 1 descuento activo a la vez** — constraint único en DB).

- `POST /` — body: `{ productId: number }` (o `comboId`). `404` si el descuento no existe. `409` si el producto ya tiene un descuento asignado.
- `GET /` — paginado, lista los targets de ese descuento.
- `DELETE /:productId` (o `:comboId`) — quita la asignación, `204`.

Response: `{ id, discountId, productId, createdAt, updatedAt }` (o `comboId` en la variante combo).

---

## 10. Cupones (`/v1/coupons`, `/v1/coupon-usage`)

**Diferencia clave con descuentos**: los cupones tienen código, vigencia por fechas, límite de usos, y se aplican a nivel de **orden completa** (no por línea de producto). También son siempre porcentuales.

### 10.1 `/v1/coupons` — catálogo de cupones

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN`.

Body (`CreateCouponDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `code` | string | sí | 3–100 chars, MAYÚSCULAS |
| `value` | number | sí | `0.01`–`100` (porcentaje) |
| `isGlobal` | boolean | sí | si `true`, aplica a cualquier orden sin necesidad de targets |
| `usageLimit` | number | no | `>= 1`, null = sin límite |
| `startsAt` | Date (ISO) | no | |
| `endsAt` | Date (ISO) | no | |

`409` si el código ya existe.

Response (`CouponResponseDto`) — incluye un **`status` calculado dinámicamente** (no se persiste, se recalcula en cada respuesta):

```json
{
  "id": 1, "code": "PROMO10", "status": "active", "value": 10,
  "isGlobal": false, "usageLimit": 100, "usageCount": 12,
  "startsAt": "2026-07-01T00:00:00.000Z", "endsAt": "2026-08-01T00:00:00.000Z",
  "createdAt": "...", "updatedAt": "..."
}
```

```ts
enum CouponStatus {
  ACTIVE = 'active', SCHEDULED = 'scheduled', EXPIRED = 'expired', EXHAUSTED = 'exhausted',
}
```
Lógica del cálculo: `EXHAUSTED` si `usageCount >= usageLimit` → si no, `EXPIRED` si ya pasó `endsAt` → si no, `SCHEDULED` si aún no llegó `startsAt` → si no, `ACTIVE`. **El frontend debería usar este campo directamente en vez de recalcular la lógica de fechas del lado cliente.**

`PATCH /v1/coupons/:id` — mismo shape, todo opcional. `DELETE /v1/coupons/:id` — soft delete; `409` si el cupón ya fue usado en alguna orden (no se puede borrar el historial).

### 10.2 `/v1/coupons/:couponId/targets/products` y `/targets/combos`

Igual patrón que discount targets. `POST` body: `{ productId: number }`. `409` si ya está asignado o si el cupón es `isGlobal: true` (no tiene sentido asignar targets a un cupón global).

### 10.3 `/v1/coupon-usage` — aplicar un cupón a una orden

#### `POST /v1/coupon-usage`
Auth: JWT + rol **`CLIENT`** (es el único endpoint de cupones que puede llamar un cliente final, no un admin).

Body (`CreateCouponUsageDto`):

| Campo | Tipo | Notas |
|---|---|---|
| `code` | string | 3–100 chars, código del cupón |
| `orderId` | number | `>= 1`, la orden a la que se aplica |
| `userId` | — | **no enviar** — se infiere del JWT automáticamente en el backend |

`400` si el cupón está inactivo/expirado/agotado. `404` si el código no existe. `409` si el usuario ya usó ese cupón antes (constraint único `couponId + userId`).

Response:
```json
{ "id": 1, "couponId": 3, "orderId": 42, "userId": 7, "appliedAt": "...", "createdAt": "...", "updatedAt": "..." }
```

#### `GET /v1/coupon-usage` (paginado), `GET /v1/coupon-usage/coupon/:couponId`, `GET /v1/coupon-usage/user/:userId`
Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` (reportes de uso, no accesibles a clientes).

---

## 11. Stock

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` en **todos** los endpoints de este bloque (no hay vista de stock pública — el frontend cliente solo ve `inStock`/`quantityAvailable`/`stockStatus` via `/v1/shop/items`, sección 6).

### 11.1 `/v1/stock-locations` — depósitos/sucursales

CRUD estándar. Body (`CreateStockLocationDto`):

| Campo | Tipo | Validación |
|---|---|---|
| `name` | string | 3–120 chars, MAYÚSCULAS |
| `type` | enum `StockLocationType` | `WAREHOUSE \| STORE \| VIRTUAL` |
| `address` | string | opcional, máx 255 chars |

### 11.2 `/v1/stock-items` — stock por producto + ubicación

- `GET /` — paginado.
- `GET /:id` — devuelve `StockItemWithMovementsResponseDto` (el item + su historial de movimientos, no solo el item).
- `POST /` — crear item. Body (`CreateStockItemDto`): `{ productId, locationId, stockMin: number (>=1), stockCritical: number (>=0, debe ser < stockMin) }`. `409` si ya existe un item para ese producto+ubicación.
- `POST /add-stock` — sumar stock (entrada). Body: `{ productId, locationId, quantity: number (>=1) }`.
- `POST /write-off` — dar de baja stock disponible (daño/pérdida/ajuste). Body: ver `CreateStockWriteOffDto` en 11.4. Requiere JWT (usa `user.sub` como `reportedBy`).
- `POST /dispatch` — descontar stock reservado (se usa al despachar una orden). Body: `{ productId, locationId, quantity, orderId }`. `400` si no hay suficiente stock reservado/actual.
- `POST /release` — liberar una reserva (al cancelar una orden). Body: `{ productId, locationId, quantity, orderId }`.
- `PATCH /:id/thresholds` — actualizar `stockMin`/`stockCritical`. Body (`UpdateStockThresholdsDto`), ambos opcionales.

> Nota de flujo: `dispatch`, `release` y `write-off` normalmente **no los llama el frontend directamente** — son operaciones que dispara el propio backend al cambiar el estado de una orden (`PATCH /orders/:id/status`). Se documentan acá porque son endpoints reales y quedan disponibles para ajustes manuales desde un panel de admin.

`StockItemResponseDto`:
```json
{
  "id": 1, "productId": 1, "productName": "CAFÉ TOSTADO", "locationId": 1, "locationName": "Depósito Central",
  "quantityCurrent": 100, "quantityReserved": 5, "quantityAvailable": 95,
  "stockMin": 10, "stockCritical": 5, "createdAt": "...", "updatedAt": "..."
}
```

### 11.3 `/v1/stock-movements` — historial (solo lectura)

`GET /` (paginado), `GET /stock-item/:stockItemId` (historial de un item), `GET /:id`.

```ts
enum StockOperationType { ENTRY = 'ENTRY', EXIT = 'EXIT', DAMAGE = 'DAMAGE', RETURN = 'RETURN' }
enum StockFlow { INBOUND = 'INBOUND', OUTBOUND = 'OUTBOUND' }
enum StockReferenceType { ORDER = 'ORDER', PURCHASE_ORDER = 'PURCHASE_ORDER', DAMAGE_REPORT = 'DAMAGE_REPORT', MANUAL = 'MANUAL' }
```

Response: `{ id, stockItemId, operationType, stockFlow, quantity, referenceType, referenceId, createdAt }` (`referenceId` es `null` cuando `referenceType: MANUAL`).

### 11.4 `/v1/stock-write-offs` — bajas por daño/pérdida (solo lectura + edición de metadata)

`GET /` (paginado), `GET /stock-item/:stockItemId`, `GET /:id`, `PATCH /:id` (solo `reason`/`description`/`attachments`, no la cantidad — eso quedó fijo al crearse vía `POST /stock-items/write-off`).

```ts
enum StockWriteOffReason {
  DAMAGED = 'DAMAGED', EXPIRED = 'EXPIRED', DEFECTIVE = 'DEFECTIVE',
  CONTAMINATED = 'CONTAMINATED', LOST = 'LOST', INVENTORY_ERROR = 'INVENTORY_ERROR', OTHER = 'OTHER',
}
```

`CreateStockWriteOffDto` (usado desde `POST /stock-items/write-off`):

| Campo | Tipo | Validación |
|---|---|---|
| `stockItemId` | number | `>= 1` |
| `quantity` | number | `>= 1` |
| `reason` | enum | ver arriba |
| `description` | string | opcional, máx 500 |
| `attachments` | string[] | opcional, URLs de fotos/evidencia |

Response: `{ id, stockItemId, movementId, quantity, reason, description, attachments, reportedBy, createdAt, updatedAt }`.

---

## 12. Órdenes (`/v1/orders`)

Todos requieren **JWT** (guard a nivel de clase). Roles adicionales solo en los endpoints de admin.

### 12.1 Máquina de estados

```ts
enum OrderStatus { PENDING = 'pending', CONFIRMED = 'confirmed', DISPATCHED = 'dispatched', DELIVERED = 'delivered', CANCELLED = 'cancelled' }
enum DeliveryType { DELIVERY = 'delivery', PICKUP = 'pickup' }
```

Transiciones válidas (`PATCH /:id/status` rechaza cualquier otra con `400`):
```
PENDING     → CONFIRMED | CANCELLED
CONFIRMED   → DISPATCHED | CANCELLED
DISPATCHED  → DELIVERED
DELIVERED   → (ninguna)
CANCELLED   → (ninguna)
```
Efectos secundarios automáticos (no requieren llamadas extra del frontend): al pasar a `DISPATCHED` se descuenta el stock reservado; al pasar a `CANCELLED` se libera la reserva de stock.

### 12.2 `POST /v1/orders` — crear orden

Auth: JWT (cualquier rol autenticado, pensado para `CLIENT`). Rate limit: 5/60s. **Soporta `Idempotency-Key`** (ver sección 15 — muy recomendado para este endpoint específico, es el único que lo implementa).

Body (`CreateOrderDto`):

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `items` | `CreateOrderItemDto[]` | sí | mínimo 1 item |
| `deliveryType` | enum `DeliveryType` | sí | |
| `address` | string | condicional | **requerido si `deliveryType: 'delivery'`**, máx 500 chars |
| `couponCode` | string | no | máx 100 chars, se normaliza a MAYÚSCULAS |
| `notes` | string | no | máx 500 chars |

`CreateOrderItemDto`: cada item es **producto O combo, no ambos** (`productId` requerido solo si no viene `comboId`, y viceversa):

| Campo | Tipo | Notas |
|---|---|---|
| `productId` | number | opcional si viene `comboId` |
| `comboId` | number | opcional si viene `productId` |
| `quantity` | number | `1`–`500` |

`400` si el payload es inválido o no hay stock suficiente. `201` con la orden creada (incluye ya el desglose de precios, ver `OrderResponseDto` abajo).

Nota: el frontend **nunca envía `locationId`** — el backend elige automáticamente la ubicación de stock con más `quantityAvailable` para reservar cada ítem.

### 12.3 `GET /v1/orders` — listado admin

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN`. Paginado estándar.

### 12.4 `GET /v1/orders/user/:userId`

Auth: JWT. Un `CLIENT` solo puede pedir sus propias órdenes (`403` si `userId` no coincide con `user.sub`); admins pueden pedir las de cualquier usuario.

### 12.5 `GET /v1/orders/:id`

Auth: JWT. Mismo control de acceso que arriba, pero a nivel de orden individual (`403` si es de otro cliente).

### 12.6 `PATCH /v1/orders/:id/status`

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` — **el cliente no puede cambiar el estado de su propia orden** (ni siquiera cancelarla vía este endpoint; si hace falta permitir auto-cancelación desde el frontend cliente, hoy no existe ese endpoint).

Body: `{ "status": OrderStatus }`. `400` si la transición no es válida según la máquina de estados de 12.1.

### `OrderResponseDto` (shape completo)

```json
{
  "id": 42,
  "createdAt": "...", "updatedAt": "...",
  "userId": 7,
  "status": "pending",
  "deliveryType": "delivery",
  "address": "Av. Corrientes 1234",
  "notes": "Sin cebolla",
  "subtotal": 3000,
  "couponDiscount": 300,
  "couponCode": "PROMO10",
  "total": 2700,
  "items": [
    {
      "id": 1, "productId": 3, "productName": "Milanesa napolitana",
      "comboId": null, "comboName": null,
      "quantity": 2, "unitPrice": 1500, "salePrice": 2000, "finalPrice": 3000
    }
  ]
}
```
`couponDiscount`/`couponCode` son `null` si la orden no tiene cupón aplicado. Cada item trae **o bien** `productId`/`productName` **o bien** `comboId`/`comboName` (el otro par siempre viene `null`).

---

## 13. Pagos (`/v1/payments`) — MercadoPago

### 13.1 `POST /v1/payments` — iniciar un pago para una orden

Auth: JWT.

Body (`CreatePaymentDto`): `{ orderId: number (>=1), provider: PaymentProvider }`

```ts
enum PaymentProvider { MERCADOPAGO = 'mercadopago', STRIPE = 'stripe' } // solo MERCADOPAGO está implementado hoy
```

`400` si la orden ya tiene un pago pendiente o no es "pagable" en su estado actual. `403` si la orden no pertenece al usuario. `404` si la orden no existe.

Response (`PaymentResponseDto`):
```json
{
  "id": 1, "orderId": 42, "provider": "mercadopago", "status": "pending",
  "externalId": "pref_abc123",
  "checkoutUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_abc123",
  "amount": 2700, "createdAt": "...", "updatedAt": "..."
}
```
**El frontend debe redirigir al usuario a `checkoutUrl`** para completar el pago en MercadoPago. El estado del pago se actualiza vía webhook (asíncrono) — el frontend no controla directamente cuándo pasa a `approved`; hay que hacer polling de `GET /payments/:id` o `GET /payments/order/:orderId` después de que el usuario vuelva del checkout.

```ts
enum PaymentStatus { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected', CANCELLED = 'cancelled' }
```

### 13.2 `GET /v1/payments/order/:orderId` y `GET /v1/payments/:id`

Auth: JWT. Mismo control de acceso por dueño de la orden que en `orders`.

### 13.3 `POST /v1/payments/webhook/mercadopago`

**No lo consume el frontend** — lo llama MercadoPago directamente. Se documenta solo para contexto: siempre responde `200`, sin rate limit, verifica firma HMAC internamente.

---

## 14. Analytics (`/v1/analytics`)

Auth: JWT + rol `SUPER_ADMIN`/`ADMIN` en los 3. Pensado para un dashboard de admin.

#### `GET /v1/analytics/orders`
```json
{
  "total": 320,
  "byStatus": { "pending": 12, "confirmed": 8, "dispatched": 5, "delivered": 280, "cancelled": 15 },
  "totalRevenue": 458300, "revenueToday": 12500, "revenueThisMonth": 89200
}
```
`totalRevenue`/`revenueToday`/`revenueThisMonth` excluyen órdenes `CANCELLED`.

#### `GET /v1/analytics/products/top`
Top 10 productos más vendidos, **solo contando órdenes en estado `DELIVERED`**:
```json
[{ "productId": 3, "name": "Milanesa napolitana", "sku": "MIL-NAP", "totalSold": 145 }]
```

#### `GET /v1/analytics/stock/critical`
Stock items en o por debajo de su umbral crítico:
```json
[{
  "id": 1, "productId": 3, "productName": "Milanesa napolitana", "sku": "MIL-NAP",
  "locationId": 1, "locationName": "Depósito Central",
  "quantityCurrent": 4, "quantityReserved": 1, "quantityAvailable": 3,
  "stockCritical": 5, "stockMin": 10
}]
```

---

## 15. Idempotencia (`Idempotency-Key`)

Solo implementado hoy en **`POST /v1/orders`**. Si el frontend hace un POST y no está seguro de si llegó al backend (timeout de red, doble click, etc.), puede reintentar con el **mismo** `Idempotency-Key` y el backend devuelve el resultado cacheado en vez de crear una orden duplicada.

- Header: `Idempotency-Key: <string único, ej. un UUID generado en el cliente>`
- TTL del cache: 24 horas.
- Si el header no se manda, el endpoint funciona normal (sin protección de duplicados).
- Si se reintenta con la misma key mientras la request original todavía está procesándose, devuelve `409 Conflict` ("Request is already being processed").
- **Recomendación**: generar un UUID nuevo por cada intento de compra del usuario (no reusar la misma key entre compras distintas), y sí reusarlo en reintentos automáticos del mismo submit.

---

## 16. Resumen de enums (referencia rápida)

```ts
// common
enum RoleType { SUPER_ADMIN = 'super_admin', ADMIN = 'admin', CLIENT = 'client' }
enum CurrencyCode { ARS = 'ARS' }

// products
enum ProductMeasurementUnit { UNIT='unit', KG='kg', GRAM='gram', LITER='liter', ML='ml', METER='meter', CM='cm', PACK='pack', BOX='box', DOZEN='dozen' }

// coupons
enum CouponStatus { ACTIVE='active', SCHEDULED='scheduled', EXPIRED='expired', EXHAUSTED='exhausted' }

// orders
enum OrderStatus { PENDING='pending', CONFIRMED='confirmed', DISPATCHED='dispatched', DELIVERED='delivered', CANCELLED='cancelled' }
enum DeliveryType { DELIVERY='delivery', PICKUP='pickup' }

// payments
enum PaymentProvider { MERCADOPAGO='mercadopago', STRIPE='stripe' }
enum PaymentStatus { PENDING='pending', APPROVED='approved', REJECTED='rejected', CANCELLED='cancelled' }

// stocks
enum StockLocationType { WAREHOUSE='WAREHOUSE', STORE='STORE', VIRTUAL='VIRTUAL' }
enum StockOperationType { ENTRY='ENTRY', EXIT='EXIT', DAMAGE='DAMAGE', RETURN='RETURN' }
enum StockFlow { INBOUND='INBOUND', OUTBOUND='OUTBOUND' }
enum StockReferenceType { ORDER='ORDER', PURCHASE_ORDER='PURCHASE_ORDER', DAMAGE_REPORT='DAMAGE_REPORT', MANUAL='MANUAL' }
enum StockWriteOffReason { DAMAGED='DAMAGED', EXPIRED='EXPIRED', DEFECTIVE='DEFECTIVE', CONTAMINATED='CONTAMINATED', LOST='LOST', INVENTORY_ERROR='INVENTORY_ERROR', OTHER='OTHER' }
```

---

## 17. Tabla resumen de todos los endpoints

| Método | Ruta | Auth | Roles |
|---|---|---|---|
| POST | `/v1/auth/register` | — | — |
| GET | `/v1/auth/activate` | — | — |
| POST | `/v1/auth/login` | — | — |
| POST | `/v1/auth/refresh` | — | — |
| POST | `/v1/auth/logout` | — | — |
| POST | `/v1/auth/logout-all` | JWT | cualquiera |
| PATCH | `/v1/auth/change-password` | JWT | cualquiera |
| POST | `/v1/auth/forgot-password` | — | — |
| POST | `/v1/auth/reset-password` | — | — |
| GET | `/v1/users` | JWT | SUPER_ADMIN, ADMIN |
| GET/PATCH/DELETE | `/v1/users/:id` | JWT | propio usuario |
| GET/POST/PATCH/DELETE | `/v1/categories` | JWT | SUPER_ADMIN, ADMIN |
| GET | `/v1/categories/tree` | JWT | SUPER_ADMIN, ADMIN |
| GET/POST/PATCH/DELETE | `/v1/products` | JWT | SUPER_ADMIN, ADMIN |
| GET/POST/PATCH/DELETE | `/v1/combos` | JWT | SUPER_ADMIN, ADMIN |
| * | `/v1/product-images`, `/v1/combo-images` | JWT | SUPER_ADMIN, ADMIN |
| GET | `/v1/shop/categories` | — | — |
| GET | `/v1/shop/items`, `/v1/shop/items/:id` | — | — |
| * | `/v1/product-pricing`, `/v1/combo-pricing` | JWT | SUPER_ADMIN, ADMIN |
| POST | `/v1/pricing/calculate/product`, `/combo` | JWT | SUPER_ADMIN, ADMIN, CLIENT |
| POST | `/v1/pricing/calculate/preview` | JWT | SUPER_ADMIN, ADMIN |
| * | `/v1/taxes`, `/v1/products/:id/taxes` | JWT | SUPER_ADMIN, ADMIN |
| * | `/v1/discounts/**` | JWT | SUPER_ADMIN, ADMIN |
| * | `/v1/coupons/**` | JWT | SUPER_ADMIN, ADMIN |
| POST | `/v1/coupon-usage` | JWT | CLIENT |
| GET | `/v1/coupon-usage/**` | JWT | SUPER_ADMIN, ADMIN |
| * | `/v1/stock-locations`, `/v1/stock-items`, `/v1/stock-movements`, `/v1/stock-write-offs` | JWT | SUPER_ADMIN, ADMIN |
| POST | `/v1/orders` | JWT | cualquiera |
| GET | `/v1/orders`, `PATCH /:id/status` | JWT | SUPER_ADMIN, ADMIN |
| GET | `/v1/orders/:id`, `/v1/orders/user/:userId` | JWT | propio o admin |
| POST/GET | `/v1/payments/**` | JWT | dueño de la orden o admin |
| POST | `/v1/payments/webhook/mercadopago` | — | (solo MercadoPago) |
| GET | `/v1/analytics/**` | JWT | SUPER_ADMIN, ADMIN |

---

## 18. Notas finales para el equipo de frontend

- **No confiar en el frontend para calcular precios finales.** Siempre usar `finalPrice`/`orderTotal` que devuelve el backend (`/shop/items`, `/pricing/calculate/*`, `OrderResponseDto`) — la lógica de descuentos/impuestos/cupones prorrateados en combos es compleja y vive solo en el backend.
- **Guardar el refresh token de forma segura** (no en `localStorage` si se puede evitar — preferir cookie `httpOnly` si el flujo de auth se puede rediseñar; mientras tanto, al menos rotarlo correctamente en cada uso).
- **El campo `status` de cupones y `stockStatus` de shop ya vienen calculados** — no reimplementar esa lógica en el frontend.
- Ante un `403` en un endpoint de "propio recurso" (`/users/:id`, `/orders/:id`), verificar primero que el `id` en la URL corresponda al usuario logueado antes de reportar como bug.
