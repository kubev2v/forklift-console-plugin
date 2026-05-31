# Phase 3: Ask More Info

**Gate:** Enters waiting state (optional phase -- only entered when investigation needs external input)

Prepares and posts a Jira comment requesting missing information, then marks the
ticket as waiting.

---

## Trigger

Use when the investigation (Phase 2) identified gaps that can't be resolved by
searching the codebase or backend repo alone.

## Steps

### 3.1 Identify what's missing

From the investigation findings, clearly list:
- What specific data/behavior is unclear
- What you've already checked
- What would unblock the investigation

### 3.2 Identify the recipient

| Ticket Type | Likely Recipient |
|-------------|-----------------|
| Bug | Reporter (check `fields.reporter`) |
| Feature / Story | Backend developer, UX researcher, or PM |
| Integration issue | Backend developer who implemented the feature |

### 3.3 Prepare and post the comment

Post directly as a Jira comment:

```bash
source .cursor/skills/dev-helper/scripts/_config.sh
source ~/.jira-creds

curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  -X POST \
  -H "Content-Type: application/json" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${TICKET_KEY}/comment" \
  -d "{\"body\": \"<comment body>\"}"
```

### 3.4 Mark as waiting

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh wait ${TICKET_KEY} awaiting-info
```

Inform the user this ticket is blocked. They can work on another ticket.

### 3.5 Return to investigation

When the response arrives (detected by `reconcile.sh` on session start, or when
the user says "resume work on MTV-XXXX"):

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh resume ${TICKET_KEY}
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} investigate
```
