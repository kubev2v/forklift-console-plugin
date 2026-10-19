# Forklift: Reproduction Rules

## Default: human checklist
Orchestrator prints steps; **you** navigate the UI and take screenshots.
Prefer this path to save tokens (no Playwright MCP loop).

## Screenshots
- **Read and follow `.agents/rules/taking-screenshots.md`** before taking
  any screenshots
- Save to `~/Downloads/${TICKET_KEY}/` with prefixes: `repro-`, `before-`, `after-`

## Console URLs (for checklist)
- Overview: `http://localhost:9000/mtv/overview`
- Plans: `http://localhost:9000/mtv/plans`
- Providers: `http://localhost:9000/mtv/providers`
- Network Maps: `http://localhost:9000/mtv/networkMaps`
- Storage Maps: `http://localhost:9000/mtv/storageMaps`

## Optional Playwright MCP override
Only if explicitly requested:
- MCP server name is workspace-specific (e.g.
  `project-0-forklift-console-plugin-playwright`)
- Use `CallMcpTool` with the workspace-specific server name
