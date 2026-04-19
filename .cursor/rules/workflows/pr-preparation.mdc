---
description: Checklist and workflow for preparing a PR
alwaysApply: false
---

# PR Preparation Workflow

Invoke with: *"prepare PR"*, *"ready for review"*, *"PR checklist"*, *"before I submit"*

Follow this comprehensive workflow before creating a pull request.

---

## 1. Code Completion Check

- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Loading/error/empty states implemented
- [ ] No TODO comments without linked issues
- [ ] No commented-out code
- [ ] No console.log statements
- [ ] No hardcoded test data

---

## 2. Code Quality Checks

### Run All Checks
```bash
npm run lint && npm test
```

### TypeScript
- [ ] No type errors
- [ ] No implicit `any` types
- [ ] Explicit return types on functions

### Linting
- [ ] ESLint passes without errors
- [ ] Prettier formatting applied

### Unit Tests
- [ ] All existing tests pass
- [ ] New tests added for new code
- [ ] Edge cases tested

---

## 3. i18n Verification

```bash
npm run i18n
```

- [ ] All user-facing strings use `t()` function
- [ ] Translation file changes committed
- [ ] Proper interpolation for dynamic values

---

## 4. Self Code Review

### Developer Perspective
- [ ] Single responsibility followed
- [ ] Files under 300 lines
- [ ] No code duplication
- [ ] No magic numbers
- [ ] Clean imports (no unused, no barrel files)
- [ ] Error handling for all async operations

### UX Perspective
- [ ] Loading states visible
- [ ] Error states informative
- [ ] Empty states guide users
- [ ] Keyboard navigation works
- [ ] PatternFly components used correctly

### QE Perspective
- [ ] Empty/null data handled
- [ ] Boundary values considered
- [ ] Double-click prevention where needed
- [ ] Test coverage adequate

### Security Perspective
- [ ] User input validated
- [ ] No XSS vulnerabilities
- [ ] No sensitive data exposed
- [ ] Permissions checked

---

## 5. Visual Verification

- [ ] Feature works as expected
- [ ] UI looks correct
- [ ] Screenshots/video for UI changes (before/after if relevant)

---

## 6. Commit Hygiene

### Commit Format
All commits must include a `Resolves:` line and be **signed off** (`-s` flag) for DCO compliance:

```bash
git commit -s -m "Brief description of the change

Detailed explanation if needed.

Resolves: MTV-XXXX"
```

**No associated ticket:**
```
Resolves: None
```

**Always use `-s` (or `--signoff`)** when committing. The DCO check will fail without `Signed-off-by`.

### Branch
- [ ] Branch up-to-date with main
- [ ] Conflicts resolved

### Validate Locally
```bash
npm run validate-commits
```

---

## 7. PR Description

When the user asks to "prepare PR", "write PR description", or similar, **always output the description as a raw Markdown code block** so it can be copied and pasted directly into GitHub/GitLab. Keep it concise -- a short summary paragraph plus a bullet list of key changes. Use the project's PR template structure from `.github/pull_request_template.md`.

### Template

```markdown
## 📝 Links

- [MTV-XXXX](https://redhat.atlassian.net/browse/MTV-XXXX)

## 📝 Description

[One-sentence summary of the change.]

- [Key change 1]
- [Key change 2]
- [Key change 3]

## 🎥 Demo

<!-- Please add a video or an image of the behavior/changes -->

## 📝 CC://

[Tag reviewers if needed]
```

---

## 8. Reviewer Selection

- **Required**: At least one code owner
- **Domain expert**: For Forklift-specific logic
- **UX**: For significant UI changes
- **QE**: For testability concerns

---

## 9. Quick Commands Reference

```bash
# Full quality check
npm run lint && npm test

# Fix lint issues
npm run lint:fix

# Update translations
npm run i18n

# Validate commits
npm run validate-commits
```
