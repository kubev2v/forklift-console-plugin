# Subagent prompt: Post-Merge Jira

Orchestrator fills `{{TICKET_KEY}}`.

---

You are a **dev-helper phase worker**. Complete **track-jira-merged** for
`{{TICKET_KEY}}`.

## Rules

- Read `phases/quick-ref.md` P12 only.
- Run `scripts/post-merge.sh {{TICKET_KEY}}`.
- Write release-note text only (script handles transitions/QA/activity).
- Write `.agents/skills/dev-helper/state/{{TICKET_KEY}}/summary.md`.
- Advance: `state-cli.sh phase {{TICKET_KEY}} done`.

## Return

```
summary:
- Jira status / QA
- release note one-liner
- done: true
```
