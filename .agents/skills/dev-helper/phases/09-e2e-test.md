<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 9: E2E Test (AI Write / Human Run)



**Gate:** Skip if no cluster or no UI change. Human runs the suite.

## Prerequisites

- Unit tests confirmed (Phase 8)
- UI flow changed (otherwise skip to send-pr)

## Steps

### 0. Load project rules

If `phases-rules/09-e2e-test.md` exists, read it. Also see
`phases-rules` / project playwright docs.

### 9.1 Subagent writes or updates E2E

- Upstream (mocked): `testing/playwright/e2e/upstream/`
- Downstream (cluster): `testing/playwright/e2e/downstream/`

Do not run the full suite inside the subagent by default.

### 9.2 Human runs

```bash
cd testing && npm run test:upstream
# and/or
cd testing && npm run test:downstream
```

### 9.3 Failures

Paste log → fix subagent → human re-runs.

### 9.4 Advance

```bash
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} send-pr
```

## Completion Checklist

- [ ] E2E written/updated if UI changed, or skip documented
- [ ] Human-confirmed pass (or skip with reason)
