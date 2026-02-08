---
name: pull-request-standard
description: >
  Detailed workflow and conventions for branches, commits, and PRs in this repo.
  Trigger: Use when preparing changes for review, creating branches, committing, or drafting PRs.
license: UNLICENSED
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating branches for new work.
- Writing commit messages and organizing commit history.
- Drafting PR titles and descriptions.

---

## Critical Patterns

- Always create a **feature branch** before changing files.
- Stage files explicitly with `git add` before committing.
- Follow the commit naming convention and branch naming convention.
- Every PR must include **Summary** + **Testing** sections.

### Pattern 1: Branch naming convention

```
<type>/<short-topic>

Examples:
feature/admin-users
fix/stock-dto-validation
chore/update-skills
```

### Pattern 2: Commit message convention

```
<Verb in imperative> <short scope>

Examples:
Add admin users endpoints
Fix stock DTO validation
Update skills documentation
```

---

## Decision Tree

```
Is there a new feature or fix? → Create a branch first
Did you stage files? → Commit with convention
Ready to share? → Open PR with summary + testing
Otherwise → Keep working
```

---

## Code Examples

### Example 1: Branch + commit

```bash
git checkout -b feature/admin-users
git add src/users
git commit -m "Add admin users endpoints"
```

### Example 2: PR body

```markdown
## Summary
- add admin users endpoints
- wire admin module into users module

## Testing
- not run (not requested)
```

---

## Commands

```bash
git checkout -b feature/branch-name   # create branch
git add .                              # stage changes
git commit -m "Add feature"             # commit
```

---

## Resources

- **Templates**: See [assets/](../assets/) for the skill template.
- **Documentation**: See CONTRIBUTING.md if added later.
