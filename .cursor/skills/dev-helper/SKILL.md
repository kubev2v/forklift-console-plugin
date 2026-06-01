---
name: dev-helper
description: >-
  Full ticket lifecycle automation from Jira to merged PR. Handles investigation,
  solution design, implementation, testing, PR creation, CI monitoring, and
  post-merge Jira tracking. Use when the user mentions work on a ticket, start
  MTV-XXXX, dev helper, ticket lifecycle, full workflow, provides a Jira URL,
  or work on next.
---

# Dev Helper -- Full Ticket Lifecycle

Orchestrates the complete developer workflow from picking up a Jira ticket to
post-merge cleanup. Each phase is documented in `phases/*.md`.

For constants, field IDs, and formulas, see [reference.md](reference.md).
For setup instructions, see [SETUP.md](SETUP.md).

## Prerequisites

### One-time setup

See [SETUP.md](SETUP.md) for the full step-by-step guide covering:

1. **Jira API credentials** (`~/.jira-creds`)
2. **GitHub CLI** (`gh auth login`)
3. **Git remotes** (fork as `origin`, upstream as `upstream`)
4. **jq** (JSON processor)
5. **Configuration** (`dev-helper.config.json`)
6. **Hooks** (copy from `examples/hooks/` -- see SETUP.md)

### Verify setup

```bash
source ~/.jira-creds && echo "Jira: OK"
gh auth status && echo "GitHub: OK"
git remote -v | grep -q upstream && echo "Remotes: OK"
which jq && echo "jq: OK"
source .cursor/skills/dev-helper/scripts/_config.sh && echo "Config: $GH_REPO"
```

## Configuration

### Project config -- `dev-helper.config.json`

Located at `.cursor/skills/dev-helper/dev-helper.config.json`. Contains
shared constants that are the same for all team members:

```json
{
  "jira": { "baseUrl", "projectKey", "componentId", "componentName" },
  "github": { "repo", "upstreamRemote", "forkRemote" },
  "workflow": { "qaContact", "prLabels", "staleWaitingDays" },
  "phases": { "gates", "skip" }
}
```

All scripts source `scripts/_config.sh` which reads this file and exports
the values as shell variables (`$JIRA_BASE_URL`, `$GH_REPO`, `$QA_CONTACT`, etc.).

### Personal secrets -- `~/.jira-creds`

Not committed (lives in home directory). Contains per-developer secrets:

```bash
JIRA_EMAIL="your-email@redhat.com"
JIRA_API_TOKEN="your-api-token"
JIRA_ASSIGNEE_ID="your-account-id"
```

### Configurable gating

The `phases` config controls how the agent behaves at each phase:

```json
"phases": {
  "gates": ["design"],
  "skip": []
}
```

- **`gates`**: Phases where the agent STOPS and waits for explicit user approval
  before proceeding. Default: `["design"]`.
- **`skip`**: Phases to skip entirely. Default: `[]`.
- **All other phases**: Auto-recap -- the agent presents a summary of findings
  and continues unless the user interrupts.

Examples:
- Fully autonomous: `"gates": [], "skip": []`
- Cautious: `"gates": ["investigate", "design", "implement"], "skip": []`
- Skip E2E: `"gates": ["design"], "skip": ["e2e-test"]`

The orchestrator checks the config before each phase transition. Phase files
themselves are simple (present findings, advance). Gating logic lives here.

## State Management

Each ticket gets a folder: `.cursor/skills/dev-helper/state/MTV-XXXX/state.json`
(with phase artifacts like `investigation.md`, `design.md` alongside)

```bash
# List tracked tickets
.cursor/skills/dev-helper/scripts/state-cli.sh list

# Show active tickets
.cursor/skills/dev-helper/scripts/state-cli.sh active

# Get a ticket's state
.cursor/skills/dev-helper/scripts/state-cli.sh get MTV-XXXX

# Add a PR to monitoring (accepts PR number, MTV-XXXX, or full PR URL)
.cursor/skills/dev-helper/scripts/state-cli.sh watch 2390

# Mark a ticket as waiting (blocked on external event)
.cursor/skills/dev-helper/scripts/state-cli.sh wait MTV-XXXX pr-ci-pending

# Resume a ticket (external event resolved)
.cursor/skills/dev-helper/scripts/state-cli.sh resume MTV-XXXX

# List all waiting tickets
.cursor/skills/dev-helper/scripts/state-cli.sh waiting
```

### Waiting States

A ticket enters "waiting" when it reaches a phase where no agent action is
possible until an external event occurs:

| Reason | Trigger | Phase |
|--------|---------|-------|
| `awaiting-info` | Waiting for external reply | ask-more-info |
| `pr-ci-pending` | CI is running | monitor-pr |
| `pr-review-pending` | Waiting for human review | monitor-pr |
| `pr-merge-pending` | Approved, not yet merged | monitor-pr |
| `rebase-conflicts` | User must resolve conflicts | monitor-pr |

When a ticket is waiting, start a different ticket. Resume waiting tickets by
saying "resume work on MTV-XXXX" or running `state-cli.sh resume MTV-XXXX`.

The `reconcile.sh` script (runs on session start via hooks) detects:
- Merged PRs -> auto-transitions Jira and advances phase
- New Jira comments on `awaiting-info` tickets -> auto-resumes
- Stale waiting states (>N days) -> flags for follow-up

---

## Orchestration Logic

When activated with a ticket (e.g., "work on MTV-5300"):

### 1. Resolve the ticket

If the user says **"work on next"** without a specific ticket key, ask them to
name a specific ticket to start or resume.

### 2. Check for existing state

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh get MTV-5300 2>/dev/null
```

- **State exists**: Read the current `phase` and resume from there.
- **Phase is `learn`**: Auto-run Phase 11b immediately. The PR is already
  merged; learning review is required before advancing.
- **Phase is `track-jira-merged`**: Auto-run Phase 12 immediately without waiting
  for user prompt. The PR is already merged; there's nothing to gate.
- **No state**: Initialize (default phase: `triage`) and start from Phase 1.

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh init MTV-5300 Bug
```

### 3. Check gating config

Before routing to the phase, read the gating config:

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
GATES=$(config_get '.phases.gates // [] | join(",")')
SKIP=$(config_get '.phases.skip // [] | join(",")')
```

- If the current phase is in `skip`: advance to the next phase immediately.
  **Exception:** The `learn` phase is a hard constraint and MUST be ignored
  in `skip` even if listed. It can never be auto-skipped.
- If the current phase is in `gates`: after the phase completes, STOP and wait
  for user approval before advancing.
- Otherwise: the phase auto-recaps (presents findings) and advances.

### 4. Route to the current phase

Read and follow the phase file matching the current state:

| Phase Value | File to Read |
|-------------|-------------|
| `triage` | `phases/01-triage.md` |
| `investigate` | `phases/02-investigate.md` |
| `ask-more-info` | `phases/03-ask-more-info.md` |
| `reproduce` | `phases/04-reproduce.md` |
| `jira-track` | `phases/05-jira-track.md` |
| `design` | `phases/06-design-solution.md` |
| `implement` | `phases/07-implement.md` |
| `verify` | `phases/08-verify.md` |
| `e2e-test` | `phases/09-e2e-test.md` |
| `send-pr` | `phases/10-send-pr.md` |
| `monitor-pr` | `phases/11-monitor-pr.md` |
| `learn` | `phases/11b-learn.md` |
| `track-jira-merged` | `phases/12-track-jira-merged.md` |
| `done` | Ticket is complete. Report summary. |

### 5. Advance phase after completion

After each phase completes successfully, update the state:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase MTV-5300 <next-phase>
```

**Phase transition validation:** The `phase` command validates prerequisites
before allowing the transition. If required artifacts or state fields are
missing, it prints the missing items and exits without changing state. Each
phase doc has a **Completion Checklist** listing what the validator checks.

If validation fails, complete the missing step and retry. For recovery
scenarios (e.g., manually fixing corrupted state), use `--force`:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase --force MTV-5300 <phase>
```

Key validations:
- `investigate` requires `triage.md` artifact and `.type` set
- `implement` through `send-pr` require `.branch` set
- `monitor-pr` requires `.prNumber` set
- `learn` requires `.pr.mergedAt` set
- `track-jira-merged` requires `.learn.status` to be `learned` or `reviewed-skipped`
- `done` requires previous phase to be `track-jira-merged`

### 6. Branch safety check

Before any code changes (phases 7-10), verify the current git branch matches the
state file's `branch` field:

```bash
current=$(git branch --show-current)
expected=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch')
if [[ -n "$expected" && "$expected" != "null" && "$current" != "$expected" ]]; then
  echo "WARNING: On branch $current but ticket expects $expected"
fi
```

### 7. Fast-track for straightforward fixes

When the `investigate` phase completes and the fix is obviously straightforward,
the agent may fast-track by skipping `ask-more-info` and `design`, going
from `reproduce` through `jira-track` directly to `implement`.

**Fast-track always includes Reproduce (Phase 4) and Jira Track (Phase 5).**
Visual evidence is mandatory for bugs; sprint/points must always be set.

**HARD CONSTRAINT -- Gates override fast-track:**

Phases listed in `phases.gates` config can NEVER be skipped by fast-track.
If `design` is in `gates`, the agent MUST run the design phase even when
all other fast-track criteria are met. Fast-track only skips phases that
are NOT gated.

**Criteria for fast-tracking** (ALL must be true):

- Root cause is immediately obvious from code inspection
- Fix is a small, isolated change (1-3 files at most)
- No design decisions or trade-offs to evaluate
- No ambiguity about the correct behavior
- The phases being skipped are NOT in the `phases.gates` config

**When fast-tracking:**

1. Complete the investigation phase as normal
2. Proceed through reproduce (Phase 4)
3. Proceed through jira-track (Phase 5) -- set sprint, points, fix version
4. Skip to `implement` only if `design` is NOT gated:
   ```bash
   .cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
     --argjson skipped '["ask-more-info","design"]' \
     '.skippedPhases = $skipped'
   .cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} implement
   ```
   If `design` IS in `phases.gates`, skip only `ask-more-info` and proceed
   to `design` normally.

**HARD CONSTRAINT -- Bugs require visual evidence:**

For Bug tickets, Reproduce (Phase 4) is **NEVER skippable**, even when
fast-tracking. If the cluster is unavailable, the agent MUST ask the user
before proceeding -- never skip silently.

### 8. Waiting behavior

When a ticket enters a **waiting state** (no agent action possible), the agent
marks it and stops:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} <reason>
```

Inform the user: "Ticket is waiting on \<reason\>. Pick another ticket to
work on, or resume this one later."

---

## Phase Summary

| # | Phase | Gate (default) | Fast-track |
|---|-------|---------------|------------|
| 1 | Triage (+ claim) | Auto-recap (gate destructive) | Required |
| 2 | Investigate | Auto-recap | Required |
| 3 | Ask More Info | Waiting (optional) | Skipped |
| 4 | Reproduce | Auto-recap (mandatory for bugs) | Required |
| 5 | Jira Track | Auto-recap | Required |
| 6 | Design Solution | **GATED** (configurable) | Skipped |
| 7 | Implement | Auto-retry 3x | Required |
| 8 | Verify (unit tests) | Auto-retry 3x | Required |
| 9 | E2E Test | Skip if no cluster | Required |
| 10 | Send PR | Autonomous (send-pr.sh) | Required |
| 11 | Monitor PR | Auto-fix + merge | Required |
| 11b | Learn | **HARD CONSTRAINT** (never skippable) | Required |
| 12 | Post-Merge Jira | Autonomous (reconcile.sh) | Required |

**Gating:** Only phases in `phases.gates` config block for approval. Default:
`["design"]`. All other phases auto-recap and continue.

**Learn (hard constraint):** Phase 11b (`learn`) cannot be added to
`phases.skip`. The agent must review the work done on every ticket before
advancing. If the PR is merged without learning (manual merge, reconcile),
the learn phase runs post-merge and opens a separate PR for any rule/doc
updates.

**Auto-retry:** Phases 7-8 self-correct up to 3 times on build/lint/test
failure.

**Merge detection:** `reconcile.sh` runs on session start and detects merged
PRs. It auto-transitions Jira and advances state.

**send-pr.sh:** Phase 10 uses `scripts/send-pr.sh` which atomically handles
push, PR creation, Jira transition, PR link, and state update.

**For Bugs:** Phase 4 (Reproduce) is NEVER skippable. Visual evidence is mandatory.

---

## Permissions

The `beforeShellExecution` hook auto-approves all commands except destructive
git operations (`push --force`, `reset --hard`, `clean -fd`). Do NOT use
`required_permissions: ["all"]` on shell commands -- the hook handles approval
automatically. Only use `required_permissions` when a command genuinely needs
to bypass the sandbox.
