# Auth Module Guidelines

## Scope
Applies to all files under `src/auth/`.

## Purpose
Provides authentication wiring (Passport strategies, guards) and login endpoints for admin and client namespaces.

## Conventions
- Keep auth wiring in `auth.module.ts`; place guards/strategies under `src/auth/strategies/`.
- Admin routes under `admin/`, client routes under `client/`; controllers: `auth.admin.controller.ts`, `auth.client.controller.ts`.
- Reuse shared decorators/enums from `src/common/` instead of redefining them.
- Any new endpoints must follow the client/admin namespace pattern and document routes below.

## Routes
- **Admin**: `/admin/auth` — `AuthAdminController`
- **Client**: `/client/auth` — `AuthClientController`

## Key Files
- `auth.module.ts`
- `service/auth.service.ts`
- `strategies/local.strategies.ts`
- `admin/auth.admin.controller.ts`
- `client/auth.client.controller.ts`
