# Human checklist: Reproduce (orchestrator-owned)

**No subagent.** Orchestrator emits this checklist for the user.

**L2 gate:** Read `.agents/skills/dev-helper/state/{{TICKET_KEY}}/investigation.md`
**once** (and `triage.md` only if needed for URLs/steps) to fill the template.
Do not re-read L2 after the user replies except to write `reproduction.md`.

---

## Template to print to the user

```markdown
## Reproduce checklist: {{TICKET_KEY}}

**Goal:** Confirm the bug/behavior with screenshots. Save under
`~/Downloads/{{TICKET_KEY}}/` with `repro-` prefix.

### Prerequisites
- [ ] Console reachable (local `http://localhost:9000` or cluster URL)
- [ ] Dev server / cluster as needed for this ticket

### Steps
1. Open: `<URL / mtv/... path from investigation>`
2. ...
3. ...

### What to look for
- **Expected:** ...
- **Actual (bug):** ...

### Screenshots
- [ ] `~/Downloads/{{TICKET_KEY}}/repro-before.png` — before trigger
- [ ] `~/Downloads/{{TICKET_KEY}}/repro-after.png` — issue visible
- (add more if useful)

### Optional diagnostics
- Browser console errors (paste if any)
- Failed network calls (paste if any)

### Reply here with one of:
- `reproduced` — brief note of what you saw
- `not reproduced` — what you saw instead
- `blocked` — why (no cluster, auth, etc.)
```

## After user replies

1. Write `.agents/skills/dev-helper/state/{{TICKET_KEY}}/reproduction.md` (steps, result, evidence paths,
   console/network notes).
2. Optionally note script path if user provided one; otherwise steps in the md
   are enough.
3. Update state:
   ```bash
   scripts/state-cli.sh set {{TICKET_KEY}} \
     --arg url "<consoleUrl>" \
     '.reproduce.consoleUrl = $url | .reproduce.reproducedAt = (now | todate)'
   ```
4. Bugs: if `blocked`, ASK — do not skip. Non-bugs without UI may advance.
5. Advance: `state-cli.sh phase {{TICKET_KEY}} jira-track`
