# AGENTS.md — Waiona Back API Overview

This file provides a concise, AI-friendly overview of the API structure, routes, and conventions.
It is meant to be shared with future AI assistants so they can quickly understand the project.

## Project summary
- Framework: NestJS (TypeScript).
- Database: PostgreSQL via TypeORM.
- App entrypoint: `src/main.ts` (global validation + serialization).
- Root module: `src/app.module.ts` (all feature modules wired here).

## Global behavior
- ValidationPipe: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- ClassSerializerInterceptor enabled globally.
- Default port: `process.env.PORT ?? 3000`.

## Route namespaces
The API is organized into **client** and **admin** namespaces:
- Client routes: `/client/...`
- Admin routes: `/admin/...`

## Routes (controller-level base paths)
### App
- `GET /` → basic health/hello response.
  - Controller: `src/app.controller.ts`

### Users (client)
- Base: `/client/users`
  - `POST /client/users` → register
  - `GET /client/users/:id` → get profile
  - `PUT /client/users/:id` → update profile
  - `PUT /client/users/:id/password` → change password
  - Controller: `src/users/client/users.client.controller.ts`

### Users (admin)
- Base: `/admin/users`
  - `POST /admin/users` → create user
  - `GET /admin/users` → list users
  - `GET /admin/users/:id` → get user
  - `PUT /admin/users/:id` → update user
  - `PUT /admin/users/:id/status` → change status
  - `PUT /admin/users/:id/reset-password` → reset password
  - `DELETE /admin/users/:id` → soft delete
  - Controller: `src/users/admin/users.admin.controller.ts`

### Categories (admin)
- Base: `/admin/categories`
  - CRUD endpoints
  - Controller: `src/categories/admin/categories.admin.controller.ts`

### Products (admin)
- Base: `/admin/products`
  - CRUD endpoints
  - Controller: `src/products/admin/products.admin.controller.ts`

### Combos (admin)
- Base: `/admin/combos`
  - CRUD endpoints
  - Product-in-combo endpoints:
    - `POST /admin/combos/product`
    - `PUT /admin/combos/product/:id`
    - `DELETE /admin/combos/product/:id`
    - `GET /admin/combos/:id/products`
  - Controller: `src/products/combos/admin/combos.admin.controller.ts`

### Images (admin)
- Base: `/admin/images`
  - CRUD endpoints
  - Product images:
    - `POST /admin/images/product`
    - `GET /admin/images/product/:productId`
  - Combo images:
    - `POST /admin/images/combo`
    - `GET /admin/images/combo/:comboId`
  - Controller: `src/products/images/admin/images.admin.controller.ts`

### Pricing (admin)
- Discounts:
  - Base: `/admin/pricing/discounts`
  - Controller: `src/pricing/discounts/admin/discounts.admin.controller.ts`
- Discount types:
  - Base: `/admin/pricing/discount-types`
  - Controller: `src/pricing/discount-types/admin/discount-types.admin.controller.ts`
- Taxes:
  - Base: `/admin/pricing/taxes`
  - Controller: `src/pricing/taxes/admin/taxes.admin.controller.ts`
- Tax types:
  - Base: `/admin/pricing/tax-types`
  - Controller: `src/pricing/tax-types/admin/tax-types.admin.controller.ts`
- Margins:
  - Base: `/admin/pricing/margins`
  - Controller: `src/pricing/margins/admin/margins.admin.controller.ts`

## Stock (data models & DTOs)
- Stock tables and entities exist for:
  - `stocks`
  - `stock_parameters`
  - `stock_movements`
  - `stock_losses`
- DTOs live in `src/stock/dto` and include:
  - create/update stock parameters
  - create stock movements and losses
  - response DTOs for stock, movements, and losses

## Implementation notes & conventions
- Consistent admin prefix: `/admin/...`.
- Most endpoints are standard CRUD (POST, GET, PUT, DELETE).
- Some controllers use `ParseIntPipe` for numeric IDs.

## Files worth knowing
- `src/main.ts` → global pipeline, serialization, app bootstrap.
- `src/app.module.ts` → module wiring and DB config.
- `src/**/**.controller.ts` → HTTP endpoints.
