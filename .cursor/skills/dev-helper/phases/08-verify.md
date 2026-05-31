# Phase 8: Verify (Unit Tests)

**Gate:** Auto-retry 3x on test failure, interrupt only if stuck

Writes and runs unit tests for the implementation. E2E tests are a separate phase.

---

## Prerequisites

- Implementation complete and build/lint clean (Phase 7)
- On the correct feature branch

## Steps

### 8.1 Identify what needs tests

Review the changes made in Phase 7:
- New utility functions or helpers -> write unit tests
- New custom hooks -> write hook tests with `@testing-library/react`
- Modified existing utilities/hooks -> update existing tests
- New types/constants -> generally no tests needed (TypeScript covers these)

### 8.2 Write unit tests

Follow `AGENTS.md` testing section and `.cursor/rules/testing.mdc` patterns.
See those files for test file placement, naming, and mocking conventions:

- Test files: `*.test.ts` or `*.test.tsx`
- Place in `__tests__/` folder adjacent to the source file
- Use `@testing-library/react` for component/hook tests
- Mock i18n with utilities from `@test-utils/mockI18n`
- Use `isEmpty()` helper in assertions where applicable

Focus on:
- Happy path behavior
- Edge cases identified during investigation
- Error/null/undefined handling
- The specific bug scenario (for bug fixes)

### 8.3 Run unit tests

```bash
npm test
```

All tests must pass (both new and existing).

### 8.4 Auto-retry loop

If tests fail:

1. Read the failure output
2. Determine if the failure is in new tests (fix the test or implementation)
   or existing tests (the implementation broke something -- fix the code)
3. Fix and re-run (max 3 attempts)

If still failing after 3 attempts, interrupt the user with error details.

### 8.5 Advance phase

If the change affects a user-visible UI flow, advance to E2E testing:
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} e2e-test
```
Read and follow `phases/09-e2e-test.md`.

If the change is purely logic/utility (no UI flow changed), skip to Send PR:
```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} send-pr
```
Read and follow `phases/10-send-pr.md`.
