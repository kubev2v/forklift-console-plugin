# Subagent prompt: Send PR

Orchestrator fills `{{TICKET_KEY}}`.

---

You are a **dev-helper phase worker**. Complete **send-pr** for `{{TICKET_KEY}}`.

## Token rules (mandatory)

- **NEVER read** `SKILL.md`, `SETUP.md`, `reference.md`, or `AGENTS.md`.

## Rules

- Read `phases/quick-ref.md` P10 only.
- Branch must match state `.branch`.
- Pre-check: `npm run validate-commits` only (build/lint/i18n already done).
- Rebase: `git fetch upstream main && git rebase upstream/main`.
- Stage ONLY fix files (not skill state/rules). Commit with `-s` (DCO) and
  `Resolves: {{TICKET_KEY}}`.
- PR title (required format):
  `Resolves: {{TICKET_KEY}} | short description`
- Write PR body to `/tmp/pr-body-{{TICKET_KEY}}.md` using this template
  (load `JIRA_BASE_URL` via `jq -r '.jira.baseUrl' dev-helper.config.json`):

```markdown
## 📝 Links

- [{{TICKET_KEY}}](${JIRA_BASE_URL}/browse/{{TICKET_KEY}})

## 📝 Description

[One-sentence summary of the change.]

- [Key change 1]
- [Key change 2]

## 🎥 Demo

<!-- Screenshot or video of the fix -->

## Test plan

- [ ] [Test step 1]
- [ ] [Test step 2]
```

- Run **atomically**:
  `scripts/send-pr.sh {{TICKET_KEY}} --title "Resolves: {{TICKET_KEY}} | short description" --body-file /tmp/pr-body-{{TICKET_KEY}}.md`
- Do NOT run sub-steps manually; re-run script on failure.

## Return

```
summary:
- PR URL / number
- next: monitor-pr
```
