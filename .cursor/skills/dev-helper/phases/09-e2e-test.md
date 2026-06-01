# Phase 9: E2E Test (Playwright)

**Gate:** Skip gracefully if no cluster available (upstream-only tests are always OK)

Writes and runs Playwright E2E tests for user-visible UI changes.

---

## Prerequisites

- Unit tests passing (Phase 8)
- Change affects a user-visible UI flow (button, form, table, modal, page)
- On the correct feature branch

## When to Skip

This phase is skipped when:
- The change is purely logic/utility with no UI flow impact
- Phase 8 already advanced directly to Send PR

## Steps

### 9.1 Check existing E2E coverage

Search for existing Playwright tests that cover the changed flow:

```bash
# Search by feature area
rg "test.*<feature keyword>" testing/playwright/e2e/ --files-with-matches

# Check page objects for the affected area
ls testing/playwright/page-objects/
```

If existing tests already cover the changed behavior, verify they still pass
(step 9.4) without writing new ones.

### 9.2 Write E2E tests (if not covered)

Follow `.cursor/rules/workflows/playwright-testing.mdc` patterns:

- **Upstream tests** (mocked data, no cluster needed):
  Place in `testing/playwright/e2e/upstream/`
  Use `setupForkliftIntercepts(page)` for API mocking

- **Downstream tests** (real cluster required):
  Place in `testing/playwright/e2e/downstream/`
  Use `test.describe.serial` when order matters

Patterns to follow:
- Use Page Object Model from `testing/playwright/page-objects/`
- Use `test.step()` for named steps in reports
- Use `data-testid` attributes (not CSS selectors)
- Use `NavigationHelper` for page navigation
- Apply version gating with `requireVersion()` if feature is version-specific

### 9.3 Check cluster and downstream test readiness

```bash
curl -sf http://localhost:9000 > /dev/null 2>&1
```

If no cluster is available:
- Run upstream tests only (mocked data, always runnable)
- Log a warning about skipped downstream tests
- Do not block PR creation -- upstream-only E2E is acceptable for PR submission

**Downstream test credentials:** Each user configures their own credentials via
personal Cursor rules (e.g. `.cursor/rules/personal-providers-credentials.mdc`).
Generate `testing/.providers.json` and `testing/e2e.env` from those credentials
if the files don't exist yet.

### 9.4 Run E2E tests

```bash
# From testing/ directory
cd testing && npm run test:upstream  # Always runnable
cd testing && npm run test:downstream  # Only if cluster + .providers.json available
```

### 9.5 Advance phase

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} send-pr
```

Proceed to Phase 10: Send PR.
Read and follow `phases/10-send-pr.md`.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] `.branch` field set in state
- [ ] E2E tests pass (or phase explicitly skipped)
