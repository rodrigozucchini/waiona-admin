---
name: nestjs-standard
description: >
  Detailed standards for working on this NestJS (TypeScript) backend.
  Trigger: Use when implementing, modifying, or reviewing NestJS modules, controllers, services, DTOs, entities, or common utilities.
license: UNLICENSED
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating or updating NestJS modules/controllers/services/DTOs/entities.
- Adjusting API routes, validation, or serialization.
- Reviewing architecture, common enums/interfaces, or project structure.

---

## Critical Patterns

- **Namespace separation**: all routes are either `/client/...` or `/admin/...`. Keep the split consistent.
- **Global validation**: `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted`, and `transform`; never rely on unchecked payloads.
- **DTO-first**: every request body must have a DTO with explicit validators.
- **Entity base**: TypeORM entities extend `BaseEntity` (id + timestamps + isDeleted).
- **No try/catch around imports** (project rule).

### Pattern 1: Controller structure (admin vs client)

```ts
@Controller('admin/example')
export class ExampleAdminController {
  constructor(private readonly service: ExampleAdminService) {}

  @Post()
  create(@Body() dto: CreateExampleDto) {
    return this.service.create(dto);
  }
}

@Controller('client/example')
export class ExampleClientController {
  constructor(private readonly service: ExampleClientService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
```

### Pattern 2: DTO validation

```ts
export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

---

## Versioning Notes

- **NestJS**: v11 (see `@nestjs/*` dependencies).
- **TypeORM**: v0.3.x (`typeorm` dependency).
- **TypeScript**: v5.7.x (`typescript` devDependency).
- Do **not** introduce features that require version upgrades without explicit approval.

---

## Project Structure Notes

- `src/common/` holds shared enums, entities, and helpers used across modules.
- Enums live in `src/common/enums` and must be reused in DTOs/entities to avoid drift.
- Interfaces (when needed) live in `src/common/interfaces` to avoid duplication.
- Common entities (`BaseEntity`, `PersonEntity`) are reused in `users` and related modules.
- Keep new domain modules aligned to existing structure: module → controller → service → dto → entity.

---

## Enums and Interfaces

- Use enums from `src/common/enums` for statuses and types (e.g., `UserStatus`, `RoleType`, `ProductType`).
- Prefer explicit enums in DTOs with `@IsEnum()` to align with entity constraints.
- Keep enum values aligned with database enum definitions to avoid migration drift.
- Interfaces should document DTO shapes or service contracts that are shared across modules.

---

## Admin vs Client Workflow

- **Admin** endpoints: manage data (CRUD, status changes, resets). Route prefix: `/admin/...`.
- **Client** endpoints: user-facing flows (register/profile). Route prefix: `/client/...`.
- If both exist for a domain, create separate controllers/modules.
- Ensure request/response DTOs are aligned per namespace (admin vs client can differ).
- Keep admin business rules stricter (e.g., status updates, soft deletes).

---

## Decision Tree

```
Is this route admin-only? → Use /admin prefix and admin module
Is this route client-facing? → Use /client prefix and client module
Are you accepting input? → Create/extend DTO with validators
Is this shared logic? → Place it in src/common
Otherwise → Follow existing patterns in module/controller/service
```

---

## Code Examples

### Example 1: Admin module wiring

```ts
@Module({
  controllers: [ExampleAdminController],
  providers: [ExampleAdminService],
})
export class ExampleAdminModule {}
```

### Example 2: Entity with BaseEntity

```ts
@Entity('examples')
export class ExampleEntity extends BaseEntity {
  @Column({ length: 100 })
  name: string;
}
```

---

## Commands

```bash
npm run lint        # Run linting
npm run test        # Run tests
npm run start:dev   # Run dev server
```

---

## Resources

- **Templates**: See [assets/](../assets/) for the skill template.
- **Documentation**: See src/app.module.ts and src/main.ts for global wiring/validation.
