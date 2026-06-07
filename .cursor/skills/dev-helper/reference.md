# Dev Helper Reference

Constants, field IDs, and formulas used across all phases.

> **Note:** Project-level constants (Jira base URL, project key, component ID,
> GitHub repo, QA contact, labels, stale threshold) are defined in
> `dev-helper.config.json` and loaded by `scripts/_config.sh`. Personal secrets
> (email, API token, assignee ID) live in `~/.jira-creds`. See the
> **Configuration** section in SKILL.md for details.

---

## Jira Constants

### Components

| Component | ID |
|-----------|-----|
| User Interface | `35732` (default -- set in config) |
| Inventory | `35725` |
| Controller | `35727` |

### Priority IDs

| Name | ID |
|------|-----|
| Blocker | 10000 |
| Critical | 10001 |
| Major | 10002 |
| Normal | 10003 |
| Minor | 10004 |

### Custom Field IDs (MTV project)

| Field | ID | Type | Notes |
|-------|-----|------|-------|
| Git Pull Request | `customfield_10875` | string | Comma-separated URLs for multiple PRs |
| Ready | `customfield_10484` | option | Value: `"True"` |

These IDs are consistent across all ticket types (Bug, Story, Task, Epic, Vulnerability).

### Jira Status Transitions

| From | To | Typical Use |
|------|----|-------------|
| New | Assigned | Phase 1 (Triage): picking up ticket |
| Assigned | In Progress | Phase 5 (Jira Track): starting work |
| In Progress | POST | Phase 10 (Send PR): PR opened (all types except Epic) |
| POST | Modified | Phase 12 (Post-Merge): PR merged (bugs only) |
| POST | Closed | Phase 12 (Post-Merge): PR merged (stories/tasks) |

**All ticket types follow the same path:** New -> Assigned -> In Progress -> POST -> final status.
Scripts chain through intermediate transitions automatically since Jira does
not allow skipping states (e.g., New directly to Closed will fail).

**Epic transitions:** Epics are never transitioned by individual PR merges.
An Epic is closed only when ALL its child stories reach Closed/Verified status
(checked in Phase 12, step 12.6).

Note: Transition IDs vary per project. Use `jira-transition.sh discover <TICKET_KEY>` to find available transitions.

---

## Fix Version

Always read dynamically from `build/release.conf` at the project root:

```bash
grep '^RVERSION=' build/release.conf | cut -d= -f2
```

Never hardcode the version -- always run the command above to get the current value.

---

## Sprint Configuration

- Sprint length: 3 weeks
- Board: Use Jira Agile API to find active sprint
- Capacity rule: if >70% of sprint time elapsed, attach to next sprint

Always query the active sprint dynamically:

```bash
.cursor/skills/dev-helper/scripts/jira-track.sh get-sprint-info
```

Never hardcode the sprint name -- it changes every 3 weeks.

---

## Story Points Scale

| Points | Size | Description | Duration |
|--------|------|-------------|----------|
| 2 | XS | Minimal work, extremely simple | Couple hours to half a day |
| 5 | S | Simple task, short acceptance criteria | 1-2 days |
| 8 | M | Few difficult aspects, mostly clear, some research | 2-4 days |
| 13 | L | Complex (new area / research / complex impl) | 4-7 days |
| 21 | XL | Too big, should be broken into smaller tasks | >1 week |

Calculation inputs: elapsed time (Assigned -> PR merged), investigation depth, work size.

---

## Complexity Classification

Set during Phase 1 (Triage). Two independent axes.

### Axis 1: Certainty (drives pipeline behavior)

| Level | Definition | Fast-track | Design phase | Investigation depth |
|-------|-----------|-----------|-------------|-------------------|
| clear | Solution known from ticket. Done this type before. | Auto-eligible | Skippable (user prompted if gated) | Minimal |
| complicated | Need investigation. Deterministic once understood. | Standard criteria | Per config | Full |
| complex | Solution shape unknown. Requirements may emerge. | Forbidden | Always mandatory | Full + Architect |

Default: `complicated`.

### Axis 2: Work Size (informational, drives estimation)

| Level | Definition | Rough SP mapping |
|-------|-----------|-----------------|
| small | 1-3 files, single area | 2-5 |
| medium | 4-10 files, crosses boundaries | 5-8 |
| large | 10+ files, multiple features | 8-21 |

Default: `medium`.

Work size does not change pipeline behavior. It helps Phase 5 set story
points and guides sprint assignment.

---

## Activity Types

| Ticket Type | Activity Type |
|-------------|---------------|
| Bug / Task | Quality / Stability / Reliability |
| Story / Epic | Product / Portfolio Work |

---

## Release Notes Fields

See [MTV New Release Notes Process](https://docs.google.com/document/d/1shX8W98lDd8rJtoQC62TlftZqFWWpfKlwKGz6-lZ-nc/edit?usp=sharing) for field definitions.

If the Google Doc is inaccessible, ask the user for the content.

---

## Git Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Bug | `bug/MTV-XXXX` | `bug/MTV-5187` |
| Story/Feature | `feat/MTV-XXXX` | `feat/MTV-4500` |
| Chore | `chore/description` | `chore/bump-types` |

---

## PR Title Format

All PRs must use this title format:

```text
Resolves: MTV-XXXX | Short description
```

The `send-pr.sh` script enforces this format.

## PR Template

From `.github/pull_request_template.md`:

```markdown
## Links

- [MTV-XXXX]($JIRA_BASE_URL/browse/MTV-XXXX)

## Description

[One-sentence summary.]

- [Change 1]
- [Change 2]

## Demo

<!-- Screenshots uploaded as release assets by send-pr.sh -->

## CC://

[Tag reviewers if needed]
```

---

## Remotes

Remote names are configured in `dev-helper.config.json` under `github.forkRemote`
and `github.upstreamRemote`. Defaults:

| Name | Points to | Config key |
|------|-----------|------------|
| `origin` | Your fork | `github.forkRemote` |
| `upstream` | `kubev2v/forklift-console-plugin` | `github.upstreamRemote` |

---

## Backend Repo

For investigation of backend behavior:

- Repo: `https://github.com/kubev2v/forklift`
- Language: Go
- Key paths: `pkg/controller/`, `pkg/provider/`, `pkg/apis/`
- Use GitHub raw content URLs for fetching source files
