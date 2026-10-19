<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 8: Verify (Unit Tests — Human Run)



**Gate:** Human runs tests; AI fixes only when failures are pasted

Writes happen in Phase 7. This phase confirms tests pass without burning a
long automated retry loop in a large context window.

---

## Prerequisites

- Implementation complete and build/lint clean (Phase 7)
- Unit test files written
- On the correct feature branch

## Steps

### 0. Load project rules

If `.agents/skills/dev-helper/phases-rules/08-verify.md` exists, read it.

### 8.1 Orchestrator asks human to run tests

Tell the user exactly:

```bash
npm test
# or scoped: npm test -- --testPathPattern=<path>
```

Wait for pasted pass/fail output.

### 8.2 On pass

Advance:

```bash
# UI flow changed:
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} e2e-test

# Logic-only:
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} send-pr
```

### 8.3 On fail

Dispatch a **fix-tests** subagent (`phases/prompts/implement-verify.md`) with
the pasted log only. Max 1–2 fix attempts, then ask the human to re-run.

### 8.4 Re-evaluation

If failures show the root cause was wrong: same protocol as Phase 7
(`.reevaluation.count`, `--force investigate`).

## Completion Checklist

- [ ] `.branch` field set in state
- [ ] Human-confirmed unit tests pass (`npm test`)
