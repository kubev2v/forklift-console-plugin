<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 10: Send PR & Track Jira



**Gate:** Autonomous (send-pr.sh handles everything atomically)

Prepares and submits the pull request, then immediately updates Jira.

**HARD CONSTRAINT:** Steps 10.3-10.8 MUST be executed via `send-pr.sh`. Do NOT
run them manually — the script handles push, PR creation, state update, Jira
transition, PR link, Ready flag, phase advance, and waiting mark atomically.
Skipping any of these steps (especially the Jira POST transition) has caused
bugs in the past.

---

## Prerequisites

- Implementation complete (Phase 7), unit tests passing (Phase 8), E2E tests passing or skipped (Phase 9)
- All lint/build checks passing
- On the correct branch
- **Read project-specific PR rules from `phases-rules/10-send-pr.md`** if it
  exists — it contains DCO sign-off requirements, PR checklists, and other steps

## Pre-PR Checklist

Run through this checklist before creating the PR:

### Code Completion
- [ ] All acceptance criteria from the ticket met
- [ ] Edge cases handled
- [ ] Loading/error/empty states implemented
- [ ] No TODO comments without linked issues
- [ ] No commented-out code
- [ ] No console.log statements

### Quality
```bash
npm run validate-commits
```

### Branch Up-to-date
```bash
git fetch upstream main
git rebase upstream/main
```

Resolve any conflicts if needed.

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/10-send-pr.md` exists. If it does,
read it now. It contains project-specific agent personas, coding standards,
and conventions that MUST be applied during this phase. Do not skip this step.


### 0b. Use provided scripts

All PR and Jira operations in this phase MUST use the provided scripts:
- `send-pr.sh` for the atomic PR creation pipeline (steps 10.3-10.8)
- `jira-transition.sh` and `jira-track.sh` for any Jira updates
Do NOT use raw `gh pr create` or raw `curl` for Jira.

### 10.0 Pre-PR verification (bugs)

If a reproduction script exists from Phase 4, re-run it on the fix branch to
confirm the issue is resolved:

```bash
REPRO_SCRIPT=".agents/skills/dev-helper/state/${TICKET_KEY}/reproduction-script.ts"
if [[ -f "$REPRO_SCRIPT" ]]; then
  # Run reproduction script via Playwright MCP to generate "after" screenshot
  # Save to ~/Downloads/${TICKET_KEY}/after-*.png
fi
```

This generates the "after" screenshot for the PR's Demo section.

### 10.1 Verify branch safety

```bash
current=$(git branch --show-current)
expected=$(.agents/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.branch')
[[ "$current" == "$expected" ]] || echo "WARNING: Wrong branch!"
```

### 10.2 Stage and commit

Stage ONLY the files related to the ticket fix. Do NOT use `git add -A` --
it will sweep in unrelated files (dev-helper state, rule files, etc.).

```bash
# Stage only the changed source files (from investigation.affectedFiles)
git add src/path/to/changed/file1.tsx src/path/to/changed/file2.ts

# If locale files were updated by npm run i18n, stage those too
git add locales/

# Verify what's staged -- should be ONLY the fix files
git diff --cached --name-only
```

Then commit with DCO sign-off:

```bash
git commit -s -m "$(cat <<EOF
Resolves: ${TICKET_KEY} | Brief description

Detailed explanation of what was changed and why.

Resolves: ${TICKET_KEY}
EOF
)"
```

Note the `-s` flag for DCO sign-off (required by CI).

### 10.3 PR title and body

**Title format (required):**

```text
Resolves: ${TICKET_KEY} | short description
```

Write the PR description to a temp file:

```bash
JIRA_BASE_URL=$(jq -r '.jira.baseUrl' .agents/skills/dev-helper/dev-helper.config.json)
cat > /tmp/pr-body-${TICKET_KEY}.md <<EOF
## 📝 Links

- [${TICKET_KEY}](${JIRA_BASE_URL}/browse/${TICKET_KEY})

## 📝 Description

[One-sentence summary of the change.]

- [Key change 1]
- [Key change 2]

## 🎥 Demo

<!-- Screenshot or video of the fix -->

## Test plan

- [ ] [Test step 1]
- [ ] [Test step 2]
EOF
```

### 10.4 Run send-pr.sh (MANDATORY)

**Do NOT skip this step. Do NOT run the sub-steps manually.**

`send-pr.sh` atomically handles ALL of the following in one command:
1. Verifies branch matches state
2. Pushes to origin
3. Creates PR on GitHub
4. Updates state file with PR URL/number
5. Transitions Jira: Bug → `POST`; Story → `In Progress` (+ parent Epic New→In Progress check); Epic/Feature Request → skip
6. Sets Jira PR link + Ready flag
7. Advances phase to monitor-pr
8. Marks ticket as waiting (pr-review-pending)

```bash
.agents/skills/dev-helper/scripts/send-pr.sh ${TICKET_KEY} \
  --title "Resolves: ${TICKET_KEY} | short description" \
  --body-file /tmp/pr-body-${TICKET_KEY}.md
```

Verify the output shows all 8 steps completed:
```
[1/8] Branch verified: ...
[2/8] Pushed to origin/...
[3/8] PR created: ...
[4/8] State updated with PR info
[5/8] Jira -> POST (Bug) / In Progress (Story) / skipped (Epic/Feature Request)
[6/8] Jira PR link + Ready flag set
[7/8] Phase -> monitor-pr
[8/8] Marked waiting: pr-review-pending
```

If any step fails, check the error and fix it before proceeding. Do NOT
advance manually — re-run `send-pr.sh` after fixing the issue.

### 10.5 Clean up and proceed

```bash
rm -f /tmp/pr-body-${TICKET_KEY}.md
```

Proceed to Phase 11 (Monitor PR).
Read and follow `phases/11-monitor-pr.md`.

## Completion Checklist

The `send-pr.sh` script handles validation atomically. After it runs:

- [ ] `.prNumber` field set in state
- [ ] `.prUrl` field set in state
- [ ] Jira transitioned: Bug → `POST`; Story → `In Progress` (+ parent Epic `New` → `In Progress` if applicable); Epic/Feature Request → skipped
- [ ] PR link set in Jira
