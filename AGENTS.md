# Repository Guidelines

## How to Use This Guide
- Start here for cross-project norms in this NestJS API.
- Each top-level module under `src/` has its own `AGENTS.md` with module-specific rules.
- When guidance conflicts, the closer `AGENTS.md` (module-level) overrides this file.

## Available Skills
Use these skills when you need deeper, standardized patterns:

| Skill | Description | URL |
|-------|-------------|-----|
| `nestjs` | NestJS modules, controllers, DTO validation, and conventions | [SKILL.md](skills/nestjs/SKILL.md) |
| `postgres` | Postgres + TypeORM migrations, schema conventions | [SKILL.md](skills/postgres/SKILL.md) |
| `pull-request` | Branch/commit/PR workflow and standards | [SKILL.md](skills/pull-request/SKILL.md) |
| `skill-creator` | Create or update skill docs/templates | [SKILL.md](skills/assets/SKILL-TEMPLATE.md) |

## Auto-invoke Skills
When performing these actions, ALWAYS consult the corresponding skill first:

| Action | Skill |
|--------|-------|
| Creating or updating API controllers/modules/DTOs | `nestjs` |
| Working on database schema or migrations | `postgres` |
| Creating branches, commits, or PRs | `pull-request` |
| Creating or updating skill docs | `skill-creator` |

---

## Project Overview

**Waiona Back** is a NestJS (TypeScript) API with Postgres via TypeORM. The API uses a **client/admin** namespace split and global validation/serialization in `src/main.ts`.

### Key Entrypoints
- App bootstrap: `src/main.ts`
- Root module: `src/app.module.ts`
- HTTP controllers: `src/**/**.controller.ts`

### Route Namespaces
- **Client**: `/client/...`
- **Admin**: `/admin/...`

---

## Tech Stack
- NestJS 11.x, TypeScript 5.7.x
- TypeORM 0.3.x, PostgreSQL
- class-validator + class-transformer

---

## Project Structure (Top-Level)
```
src/
├── auth/
├── categories/
├── common/
├── database/
├── permissions/
├── pricing/
├── products/
├── roles/
├── stock/
└── users/
```

Each folder contains an `AGENTS.md` with module-specific rules and conventions.

---

## Development Commands
```bash
npm run start:dev      # Start API in watch mode
npm run lint           # Lint + auto-fix
npm run test           # Unit tests
npm run test:e2e        # E2E tests
npm run migrations:run  # Run TypeORM migrations
```

---

## Commit & Pull Request Guidelines
- Follow the branch and commit rules in `skills/pull-request/SKILL.md`.
- Include test results (or explain why not run) in PR summaries.
- For any API route changes, update the relevant module `AGENTS.md`.
