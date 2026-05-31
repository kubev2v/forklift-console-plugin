# Phase 5: Jira Track

**Gate:** Auto-recap (present what was set, continue)

Sets Jira fields that require investigation context: story points, sprint, fix
version. Also transitions the ticket to In Progress since implementation is
about to begin.

---

## Prerequisites

- Investigation complete (Phase 2)
- Reproduction complete for bugs (Phase 4)
- Agent has full understanding of the work scope

## Steps

### 5.1 Transition to In Progress

```bash
.cursor/skills/dev-helper/scripts/jira-transition.sh ${TICKET_KEY} "In Progress"
```

If already In Progress, skip.

**WARNING:** Do NOT use "POST" here. POST is reserved for Phase 10 (Send PR)
after the PR is created. This step uses "In Progress" only.

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
.cursor/skills/dev-helper/scripts/jira-track.sh set-story-points ${TICKET_KEY} <POINTS>
```

### 5.3 Determine and set sprint

```bash
.cursor/skills/dev-helper/scripts/sprint-lookup.sh
```

The script recommends active or next sprint based on capacity and timing.
Present the recommendation and attach the ticket.

### 5.4 Set fix version

```bash
FIX_VERSION=$(grep '^RVERSION=' build/release.conf | cut -d= -f2)
.cursor/skills/dev-helper/scripts/jira-track.sh set-fix-version ${TICKET_KEY} "${FIX_VERSION}"
```

### 5.5 Check parent epic (stories only)

If the ticket is a Story, check if its parent Epic is In Progress. If not,
transition the Epic too.

### 5.6 Recap and advance

Present a summary of what was set:

```
## Jira Tracking: ${TICKET_KEY}

**Status:** In Progress
**Story Points:** <points>
**Sprint:** <sprint name>
**Fix Version:** <version>
```

Advance to next phase. If fast-tracking (design was skipped) AND design is NOT
gated, go directly to implement. **Gates always take precedence over fast-track.**

```bash
SKIPPED=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.skippedPhases // [] | join(",")')
GATES=$(jq -r '.phases.gates // [] | join(",")' .cursor/skills/dev-helper/dev-helper.config.json)

if [[ "$SKIPPED" == *"design"* && "$GATES" != *"design"* ]]; then
  # Fast-track AND design is not gated -- skip to implement
  .cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} implement
else
  # Design is gated or not skipped -- always run design
  .cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} design
fi
```

**IMPORTANT:** Do NOT transition to POST here. POST is reserved for Phase 10
(Send PR) after the PR is created. This phase transitions to In Progress only.
