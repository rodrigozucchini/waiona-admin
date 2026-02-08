---
name: pull-request-standard
description: >
  Standard workflow and conventions for branches, commits, and PRs in this repo.
  Trigger: Use when preparing changes for review, making commits, or drafting PRs.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
---

## When to Use

Use this skill when:
- Creating branches or planning PRs.
- Writing commit messages.
- Drafting PR titles and descriptions.

---

## Critical Patterns

- Create a branch before making changes.
- Stage changes with `git add` before committing.
- Follow commit convention: **imperative mood**, concise, and scoped if needed.
- PRs must include a clear summary and testing section.

### Pattern 1: Commit message

```text
Add admin users service and controller
```

### Pattern 2: PR body

```markdown
## Summary
- add admin users endpoints
- wire admin module into users module

## Testing
- not run (not requested)
```

---

## Decision Tree

```
Did you create a new branch? → Proceed
Did you stage files? → Commit with convention
Ready to share? → Open PR with summary + testing
Otherwise → Keep working on changes
```

---

## Code Examples

### Example 1: Branch + commit

```bash
git checkout -b feature/admin-users
git add src/users
git commit -m "Add admin users endpoints"
```

### Example 2: PR creation (summary/testing)

```markdown
## Summary
- add admin users endpoints

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
