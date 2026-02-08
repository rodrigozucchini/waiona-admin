---
name: postgres-standard
description: >
  Conventions for PostgreSQL schema usage, seed data, and migrations in this repo.
  Trigger: Use when adding database entities, writing SQL, or reviewing data model changes.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating or updating TypeORM entities.
- Writing SQL scripts (seed data, fixes, migrations).
- Reviewing database naming and constraints.

---

## Critical Patterns

- Use snake_case table names (matches TypeORM entities).
- Keep `BaseEntity` fields (`id`, `createdAt`, `updatedAt`, `isDeleted`) consistent.
- For joins, follow existing join table names (e.g., `role_permissions`, `product_taxes`).

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

## Decision Tree

```
Is this a new entity? → Define TypeORM entity + update migrations
Is this data-only? → Provide SQL seed script
Is this a join table? → Follow existing join table naming
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
psql -f seed-data.sql   # run a seed script locally
pg_dump                # export schema/data
pg_restore             # restore backup
```

---

## Resources

- **Templates**: See [assets/](../assets/) for the skill template.
- **Documentation**: PostgreSQL and TypeORM docs.
