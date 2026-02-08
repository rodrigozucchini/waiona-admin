---
name: nestjs-standard
description: >
  Standard practices for working on this NestJS (TypeScript) backend.
  Trigger: Use when implementing, modifying, or reviewing NestJS modules, controllers, services, DTOs, or entities.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating or updating NestJS modules/controllers/services/DTOs/entities.
- Adding or adjusting API routes, validation, or serialization.
- Reviewing architectural consistency in the backend.

---

## Critical Patterns

- Keep **client** and **admin** routes separated (`/client/...` vs `/admin/...`).
- Use `ValidationPipe` conventions: whitelist, forbidNonWhitelisted, transform (already global).
- Prefer explicit DTO validation decorators for all request bodies.
- Keep TypeORM entities consistent with existing patterns (BaseEntity with timestamps + isDeleted).
- Avoid try/catch around imports (project rule).

### Pattern 1: Controller structure

```ts
@Controller('admin/example')
export class ExampleAdminController {
  constructor(private readonly service: ExampleAdminService) {}

  @Post()
  create(@Body() dto: CreateExampleDto) {
    return this.service.create(dto);
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

## Decision Tree

```
Is this route admin-only? → Use /admin prefix and admin module
Is this route client-facing? → Use /client prefix and client module
Are you accepting input? → Create/extend DTO with validators
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
- **Documentation**: See project files like src/app.module.ts and src/main.ts.
