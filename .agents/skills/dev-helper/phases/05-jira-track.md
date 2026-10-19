<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 5: Jira Track



**Gate:** Auto-recap (present what was set, continue)

Sets Jira fields that require investigation context: story points, sprint, fix
version. No status transitions happen in this phase — each ticket type manages
its own status lifecycle driven by PR events (Phase 10 and Phase 12).

---

## Prerequisites

- Investigation complete (Phase 2)
- Reproduction complete for bugs (Phase 4)
- Agent has full understanding of the work scope

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/05-jira-track.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.


### 5.1 Status check (no transitions)

No Jira status transitions happen in Phase 5. Each ticket type has its own
PR-lifecycle-driven path:

| Type | Status at Phase 5 | Next transition | Trigger |
|------|-------------------|-----------------|---------|
| Bug | `ASSIGNED` (set in Phase 1) | `POST` | Phase 10: PR posted |
| Story | `New` | `In Progress` | Phase 10: PR posted |
| Epic | `New` | `In Progress` | Phase 10: first child Story goes In Progress |
| Feature Request | `New` | (none — manual) | n/a |

```bash
TYPE=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.type')

case "$TYPE" in
  Bug)
    echo "Bug ${TICKET_KEY}: stays at ASSIGNED (Phase 1 set it) — next transition at Phase 10 (POST)"
    ;;
  Story)
    echo "Story ${TICKET_KEY}: stays at New — In Progress triggered at Phase 10 when PR is posted"
    ;;
  Epic)
    echo "Epic ${TICKET_KEY}: stays at New — In Progress triggered at Phase 10 when first child Story goes In Progress"
    ;;
  "Feature Request"|Feature)
    echo "Feature Request ${TICKET_KEY}: stays at New — no auto-transitions"
    ;;
  *)
    echo "${TYPE} ${TICKET_KEY}: no transition in this phase"
    ;;
esac
```

**WARNING:** Do NOT transition to Post or In Progress here. Those happen in Phase 10 (Send PR).

### 5.2 Calculate and set story points

Based on investigation findings and reproduction results, estimate the work:

| Points | Duration | Complexity |
|--------|----------|------------|
| 2 (XS) | Hours to half a day | Trivial change |
| 5 (S) | 1-2 days | Simple, clear criteria |
| 8 (M) | 2-4 days | Some research, moderate complexity |
| 13 (L) | 4-7 days | Complex, new area, significant research |
| 21 (XL) | >1 week | Should have been broken into smaller tasks |

Consider: number of affected files, investigation depth, design complexity,
testing requirements, and whether backend changes are involved.

```bash
.agents/skills/dev-helper/scripts/jira-track.sh set-story-points ${TICKET_KEY} <POINTS>
```

### 5.3 Determine and set sprint

```bash
.agents/skills/dev-helper/scripts/sprint-lookup.sh
```

The script recommends active or next sprint based on capacity and timing.
Present the recommendation and attach the ticket.

### 5.4 Set fix version

```bash
FIX_VERSION=$(grep '^RVERSION=' build/release.conf | cut -d= -f2)
.agents/skills/dev-helper/scripts/jira-track.sh set-fix-version ${TICKET_KEY} "${FIX_VERSION}"
```

### 5.5 Note parent Epic (stories only — informational)

If the ticket is a Story, look up its parent Epic and note it in state for
later use by Phase 10. **Do not transition the Epic here.** The Epic's
`In Progress` transition happens at Phase 10 when the Story's PR is posted
(that event is what drives Epic → In Progress).

```bash
source .agents/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

if [[ "$TYPE" == "Story" ]]; then
  PARENT_KEY=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
    "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}?fields=parent" \
    | jq -r '.fields.parent.key // empty')

  if [[ -n "$PARENT_KEY" ]]; then
    EPIC_STATUS=$(curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
      "${JIRA_BASE_URL}/rest/api/2/issue/${PARENT_KEY}?fields=status" \
      | jq -r '.fields.status.name')
    echo "Parent Epic: ${PARENT_KEY} (currently ${EPIC_STATUS}) — will transition to In Progress at Phase 10"
    .agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
      --arg pk "$PARENT_KEY" '.parentEpic = $pk' 2>/dev/null || true
  fi
fi
```

### 5.6 Recap and advance

Present a summary of what was set:

```text
## Jira Tracking: ${TICKET_KEY}

**Status:** ASSIGNED (Bug — unchanged) / New (Story — unchanged) / New (Epic — unchanged)
**Story Points:** <points>
**Sprint:** <sprint name>
**Fix Version:** <version>
```

Advance to next phase. If fast-tracking (design was skipped) AND design is NOT
gated, go directly to implement. **Gates always take precedence over fast-track.**

```bash
SKIPPED=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.skippedPhases // [] | join(",")')
GATES=$(jq -r '.phases.gates // [] | join(",")' .agents/skills/dev-helper/dev-helper.config.json)

if [[ "$SKIPPED" == *"design"* && "$GATES" != *"design"* ]]; then
  # Fast-track AND design is not gated -- skip to implement
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} implement
else
  # Design is gated or not skipped -- always run design
  .agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} design
fi
```

## Completion Checklist

No hard validation for this phase -- the Jira fields are set via
`jira-track.sh` commands. Verify these were called:

- [ ] Story points set (`jira-track.sh set-story-points`)
- [ ] Sprint assigned (`sprint-lookup.sh`)
- [ ] Fix version set (`jira-track.sh set-fix-version`)
- [ ] Jira status confirmed: Bug stays at `ASSIGNED`; Story/Epic/Feature Request stay at `New` — no transitions this phase
- [ ] Parent Epic noted in state (if Story, step 5.5)

**IMPORTANT:** No status transitions happen in this phase. All transitions are PR-lifecycle-driven:
- Bug: `ASSIGNED` → `POST` at Phase 10 (PR posted)
- Story: `New` → `In Progress` at Phase 10 (PR posted); `In Progress` → `Done` at Phase 12 (PR merged)
- Epic: `New` → `In Progress` at Phase 10 (first child Story posts PR); `In Progress` → `Done` at Phase 12 (all children Done)
