---
name: postgres-standard
description: >
  Detailed PostgreSQL conventions for schema design, seed data, and migrations in this repo.
  Trigger: Use when adding entities, writing SQL scripts, or planning migrations.
license: UNLICENSED
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating or updating TypeORM entities.
- Writing SQL scripts (seed data, fixes, migrations).
- Reviewing database naming, constraints, or data integrity rules.

---

## Critical Patterns

- Use **snake_case** table names (matches TypeORM entities).
- Keep `BaseEntity` fields (`id`, `createdAt`, `updatedAt`, `isDeleted`) consistent.
- Join tables must follow existing naming conventions (e.g., `role_permissions`, `product_taxes`).

### Pattern 1: Insert with timestamps

```sql
INSERT INTO categories (name, "createdAt", "updatedAt", "isDeleted")
VALUES ('Bebidas', now(), now(), false);
```

### Pattern 2: Join table insert

```sql
INSERT INTO product_taxes (product_id, tax_id)
VALUES (1, 1);
```

---

## Migrations (Full vs Partial)

- **Full migration**: used when introducing new entities or major schema changes.
  - Add new TypeORM entity + generate migration.
  - Migration includes table creation + indexes + foreign keys.
  - Validate constraints and enum values against `src/common/enums`.
  - Apply in dev/stage and verify with basic queries.
- **Partial migration**: used for small adjustments (column add/rename, index updates).
  - Keep changes minimal and focused to reduce risk.
  - Ensure backward compatibility with existing data.
  - Verify with targeted queries.

### Full migration flow (example)

1. Define entity changes in `src/**/entities/*.entity.ts`.
2. Generate migration using project scripts.
3. Review SQL for indexes and FK constraints.
4. Apply migration in dev/stage before production.
5. Validate new tables/columns with a simple select.

### Partial migration flow (example)

1. Create a migration for a single change (e.g., add column).
2. Verify with a targeted query.
3. Apply in dev/stage before production.

---

## Decision Tree

```
Is this a new entity? → Full migration (create table + constraints)
Is this a small adjustment? → Partial migration (focused diff)
Is this data-only? → Provide SQL seed script
Otherwise → Keep consistent with current schema
```

---

## Code Examples

### Example 1: Entity timestamps

```ts
@Entity('margins')
export class MarginEntity extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;
}
```

### Example 2: Seed data block

```sql
INSERT INTO margins (value, "isPercentage", "createdAt", "updatedAt", "isDeleted")
VALUES (30.00, true, now(), now(), false);
```

---

## Commands

```bash
npm run migrations:generate  # generate migration from entities
npm run migrations:show      # list migrations
npm run migrations:run       # run pending migrations
psql -f seed-data.sql        # run a seed script locally
pg_dump                      # export schema/data
pg_restore                   # restore backup
```

---

## Resources

- **Templates**: See [assets/](../assets/) for the skill template.
- **Documentation**: PostgreSQL and TypeORM docs.
