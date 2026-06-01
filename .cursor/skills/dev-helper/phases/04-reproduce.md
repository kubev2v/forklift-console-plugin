# Phase 4: Reproduce

**Gate:** Auto-recap (present evidence, continue)
**For Bug tickets:** This phase is mandatory -- visual evidence is required.
**For non-bug tickets only:** Skip if there is no UI to reproduce.

**HARD CONSTRAINT:** For Bug tickets, this phase is NEVER skippable. If the
cluster is unavailable or reproduction fails, the agent MUST NOT skip this
phase. Instead:
1. Document that reproduction was attempted but could not be completed
2. Save a reproduction artifact noting the blocker reason
3. ASK the user: "Cluster is unavailable. Should I wait, or proceed without
   visual evidence?" Do NOT auto-advance.

Attempts to reproduce the reported issue in a live browser using the Playwright
MCP, captures evidence, and saves a reusable reproduction script for later
verification.

---

## Prerequisites

- Console running and connected to a cluster (`npm run console` or real cluster URL)
- Dev server running (`npm start`) if testing against local code
- Playwright MCP server active (configured in `.cursor/mcp.json`)

## MCP Server

Use the Playwright MCP server for all browser interactions. The server name is
workspace-specific (e.g. `project-0-forklift-console-plugin-playwright`). Check
your available MCP servers if the name differs.

Key tools: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill`,
`browser_wait_for`, `browser_take_screenshot`, `browser_network_requests`,
`browser_run_code`, `browser_console_messages`.

## Steps

### 4.1 Determine console URL

Check state file for a previously used URL, or ask the user:

```bash
URL=$(.cursor/skills/dev-helper/scripts/state-cli.sh field ${TICKET_KEY} '.reproduce.consoleUrl // empty' 2>/dev/null)
```

Common URLs:
- Local: `http://localhost:9000`
- Cluster: `https://console-openshift-console.apps.<cluster>/`

### 4.2 Verify cluster connectivity

Navigate to the console and confirm it loads:

```
CallMcpTool: project-0-forklift-console-plugin-playwright
  browser_navigate -> { "url": "<consoleUrl>/mtv" }
```

Then wait for the page to load:

```
CallMcpTool: browser_wait_for -> { "text": "Providers" }
```

If the console is not reachable, ask the user:
- Provide a different URL
- Start the console (`npm run console`)
- For non-bug tickets only: skip this phase (fall back to manual reproduction later)

If the page requires authentication:
1. Take a snapshot to identify the login form
2. Use `browser_fill` for username/password fields
3. Use `browser_click` to submit
4. Wait for the main page to load

### 4.3 Follow reproduction steps from the ticket

**Read and follow `.cursor/rules/taking-screenshots.mdc` before taking any screenshots.**

Based on the investigation findings (Phase 2), navigate through the UI
following the steps that trigger the issue.

At each significant step:

1. **Snapshot** -- `browser_snapshot` to get the accessibility tree with element refs
2. **Interact** -- `browser_click`, `browser_fill`, `browser_select_option` using refs from the snapshot
3. **Wait** -- `browser_wait_for` to handle async loading (spinners, data fetching)
4. **Screenshot** -- `browser_take_screenshot` at key moments (before/after the bug manifests). Save reproduction screenshots to `~/Downloads/${TICKET_KEY}/` with `repro-` prefix.
5. **Network** -- `browser_network_requests` with filter to check specific API calls if the issue involves data

Example flow for a navigation bug:
```
browser_navigate -> mtv/providers
browser_snapshot -> get element refs
browser_click -> { ref: "<provider-row-ref>" }
browser_wait_for -> { text: "Virtual machines" }
browser_click -> { ref: "<vms-tab-ref>" }
browser_snapshot -> check if VMs appear
browser_take_screenshot -> { type: "png", filename: "repro-vms-tab.png" }
```

### 4.4 Check for errors

After reproducing the issue, check for JavaScript console errors:

```
CallMcpTool: browser_console_messages
```

And check network requests for failed API calls:

```
CallMcpTool: browser_network_requests -> { "static": false, "requestBody": false, "requestHeaders": false, "filter": "/api/.*forklift" }
```

### 4.5 Save reproduction script

Write the reproduction steps as a reusable Playwright script:

```typescript
// .cursor/skills/dev-helper/state/${TICKET_KEY}/reproduction-script.ts
// Reproduction script for ${TICKET_KEY}
// Generated during Phase 4 on ${DATE}
//
// Returns: { reproduced: boolean, details: string }

export default async (page) => {
  // Navigate to the affected page
  await page.goto('${CONSOLE_URL}/mtv/...');
  await page.waitForLoadState('networkidle');

  // Perform the steps that trigger the issue
  // ... (specific to the ticket)

  // Check if the issue is present
  const issuePresent = await page.locator('[data-testid="..."]').count() === 0;

  return {
    reproduced: issuePresent,
    details: issuePresent
      ? 'Issue confirmed: [description of what was observed]'
      : 'Could not reproduce: [description of what was seen instead]',
  };
};
```

Save the file using the Write tool.

### 4.6 Update state

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg url "${CONSOLE_URL}" \
  --arg script ".cursor/skills/dev-helper/state/${TICKET_KEY}/reproduction-script.ts" \
  '.reproduce.consoleUrl = $url | .reproduce.scriptPath = $script | .reproduce.reproducedAt = (now | todate)'
```

### 4.7 Save reproduction artifact

Write the reproduction recap to the ticket's artifact folder:

```
File: .cursor/skills/dev-helper/state/${TICKET_KEY}/reproduction.md
```

Content: steps taken, whether reproduced, evidence (screenshots, console errors,
network failures), and reproduction script path. Use the Write tool.

### 4.8 Present findings and advance

Present a summary of the reproduction results, then advance:

```bash
.cursor/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} jira-track
```

If the issue could not be reproduced, the user may choose to:
- Retry with different steps
- Move to `ask-more-info` for clarification from the reporter
- For non-bug tickets only: skip and proceed to Jira Track (Phase 5) based on code analysis alone

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] For Bug tickets: `state/${TICKET_KEY}/reproduction-script.ts` or `reproduction.md` exists
- [ ] Screenshots saved (recommended but not enforced by script)
