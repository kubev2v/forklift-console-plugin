# Dev-Helper Skill Setup

Complete setup guide for the `dev-helper` Cursor skill.

---

## 0. Install the Skill

```bash
cd your-project
git clone https://github.com/avivtur/dev-helper .agents/skills/dev-helper
```

Then add this line to your project's `.gitignore`:

```
.agents/skills/dev-helper/
```

This prevents the skill from being accidentally committed to your project
repo. The skill is a local tool, not part of your project's source code.

---

## Prerequisites

Ensure the following tools are installed and available on your `$PATH`:

| Tool | Purpose | Install |
|------|---------|---------|
| `jq` | JSON parsing in scripts | `brew install jq` |
| `gh` | GitHub CLI for PRs and repo operations | `brew install gh` (then `gh auth login`) |
| `git` | Version control with remotes configured | Already installed |
| `curl` | Jira REST API calls | Already installed |

### Git Remotes

Your local clone must have two remotes configured:

```bash
# Verify remotes
git remote -v

# Expected:
# origin    git@github.com:<your-fork>/forklift-console-plugin.git (fetch)
# upstream  git@github.com:kubev2v/forklift-console-plugin.git (fetch)
```

If missing, add them:

```bash
git remote add upstream git@github.com:kubev2v/forklift-console-plugin.git
git remote add origin git@github.com:<your-username>/forklift-console-plugin.git
```

---

## 1. Jira API Credentials

Create `~/.jira-creds` with your Atlassian API token:

```bash
cat > ~/.jira-creds << 'EOF'
JIRA_EMAIL=your-email@redhat.com
JIRA_API_TOKEN=your-atlassian-api-token
JIRA_ASSIGNEE_ID=your-jira-account-id
EOF
chmod 600 ~/.jira-creds
```

Find your account ID: go to your Jira profile, the URL contains `/people/<account-id>`.

To generate an API token, visit: https://id.atlassian.com/manage-profile/security/api-tokens

**Security note:** The credentials file is parsed as key-value text, not
sourced as bash. Only three keys are accepted: `JIRA_EMAIL`,
`JIRA_API_TOKEN`, `JIRA_ASSIGNEE_ID`. Lines with unrecognized keys or
malformed syntax are ignored with a warning. This prevents command injection
if the file is tampered with.

### Verify Jira access

```bash
source ~/.jira-creds
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "https://redhat.atlassian.net/rest/api/2/myself" | jq .displayName
```

---

## 2. Configuration File

The skill reads project settings from `dev-helper.config.json` in the skill root.

Copy one of the examples and customize:

```bash
cd .agents/skills/dev-helper

# Minimal (3 required fields):
cp examples/config.minimal.json dev-helper.config.json

# Or full (all fields with Forklift reference values):
cp examples/config.full.json dev-helper.config.json
```

Edit values as needed:

| Field | Description |
|-------|-------------|
| `jira.baseUrl` | Jira instance URL |
| `jira.projectKey` | Jira project key (e.g., `MTV`) |
| `jira.componentId` | Numeric ID of your Jira component |
| `jira.componentName` | Display name of the component |
| `github.repo` | `owner/repo` format |
| `github.upstreamRemote` | Name of the upstream remote (usually `upstream`) |
| `github.forkRemote` | Name of your fork remote (usually `origin`) |
| `workflow.qaContact` | QA contact name for Jira assignments |
| `workflow.prLabels` | Labels to apply to PRs |
| `workflow.staleWaitingDays` | Days before a "waiting" ticket is flagged stale |
| `phases.gates` | Phases that stop for user approval (default: `["design"]`) |
| `phases.skip` | Phases to skip (`learn` cannot be skipped) |
| `phases.models.default` | Cheapest tier — Composer (`composer-2.5`); all mechanical phases + `clear` creative |
| `phases.models.medium` | Medium tier — Grok (`cursor-grok-4.6-high`); `complicated` creative phases |
| `phases.models.strong` | Strong tier — Opus (`claude-4.6-opus-max-thinking`); `complex` creative — **requires your approval before dispatch** |

Resolve at runtime:

```bash
.agents/skills/dev-helper/scripts/resolve-model.sh design complex --json
```

### Gating, models, and token-saving

```json
"phases": {
  "gates": ["design"],
  "skip": [],
  "models": {
    "default": "composer-2.5",
    "medium": "cursor-grok-4.6-high",
    "strong": "claude-4.6-opus-max-thinking"
  }
}
```

- **`gates`**: Stop for user approval before continuing (default: design).
- **`skip`**: Skip phases entirely (`learn` is never skippable).
- **`models`**: Three tiers — cheapest first; scale up by ticket complexity.
  - `clear` → Composer (automatic)
  - `complicated` → Grok (automatic)
  - `complex` → Opus recommended — **orchestrator MUST ask you before dispatch**
  - Mid-ticket escalation to Grok/Opus → ask A/B/C/D menu (see SKILL.md)
  - Unavailable slug → fall back to `composer-2.5`

Token-saving defaults (see SKILL.md):

- Parent agent is a **lightweight orchestrator**; phase work runs in **subagents**
  with fresh context (`phases/prompts/`).
- **Reproduce** is a human checklist (no Playwright MCP by default).
- **Verify / E2E**: AI writes tests; human runs them and pastes failures.
- **Personas**: `clear` → Developer + QE; `complicated`/`complex` → all five.
- **Learn** on `clear` with zero PR comments → auto `reviewed-skipped`.

---

## 3. Cursor Hooks

Hooks provide session-level automation (context injection, session logging, shell approval).

### Copy hook scripts

```bash
cp .agents/skills/dev-helper/examples/hooks/*.sh .cursor/hooks/
chmod +x .cursor/hooks/personal-dev-helper-state.sh
chmod +x .cursor/hooks/personal-session-summary.sh
chmod +x .cursor/hooks/personal-shell-allowlist.sh
```

### Register hooks in `.cursor/hooks.json`

Merge the entries from `examples/hooks.json` into your `.cursor/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "onNewConversation",
      "script": ".cursor/hooks/personal-dev-helper-state.sh",
      "description": "Injects active dev-helper ticket context into new sessions"
    },
    {
      "event": "onExitConversation",
      "script": ".cursor/hooks/personal-session-summary.sh",
      "description": "Appends session summary to daily log on conversation end"
    },
    {
      "event": "beforeShellExecution",
      "script": ".cursor/hooks/personal-shell-allowlist.sh",
      "description": "Auto-approves shell commands except destructive git ops"
    }
  ]
}
```

If you already have a `hooks.json`, merge the entries into the existing `hooks` array.

---

## 4. Dashboard Extension (optional)

The skill includes a Cursor sidebar extension that provides a visual
dashboard: your PRs with merge readiness, PRs to review, Jira backlog
with filters, and tickets on hold. It uses the same `dev-helper.config.json`
and `~/.jira-creds` — no separate configuration needed.

### Install and build

```bash
cd .agents/skills/dev-helper/dashboard
npm install
npm run build
```

### Link into Cursor

```bash
ln -s "$(pwd)/.agents/skills/dev-helper/dashboard" ~/.cursor/extensions/dev-helper-dashboard
```

Reload the Cursor window. The "Dev Helper" icon appears in the activity bar.

### What it needs

- `dev-helper.config.json` (step 2 above) — reads `jira.*` and `github.*`
  fields for API calls and dashboard display
- `~/.jira-creds` (step 1 above) — authenticates Jira API requests
- `gh auth login` (prerequisites) — authenticates GitHub API requests

If any of these are missing, the dashboard shows a **Setup Checklist** at
the top telling you exactly which prerequisites are not configured yet and
which section of this file to read.

---

## 5. Verify Setup

Run these commands to confirm everything works:

```bash
# 1. Config file is parseable
jq . .agents/skills/dev-helper/dev-helper.config.json

# 2. Config reader works
source .agents/skills/dev-helper/scripts/_config.sh
echo "Project: $JIRA_PROJECT_KEY | Repo: $GH_REPO"

# 3. Jira access
source ~/.jira-creds
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/myself" | jq .displayName

# 4. GitHub CLI
gh repo view "$GH_REPO" --json name -q .name

# 5. Hooks are executable
.cursor/hooks/personal-dev-helper-state.sh
.cursor/hooks/personal-shell-allowlist.sh <<< '{"command": "echo test"}'
```

---

## Directory Structure After Setup

```
.cursor/
├── hooks.json
├── hooks/
│   ├── personal-dev-helper-state.sh
│   ├── personal-session-summary.sh
│   └── personal-shell-allowlist.sh
└── skills/
    └── dev-helper/
        ├── SKILL.md
        ├── SETUP.md              ← this file
        ├── dev-helper.config.json
        ├── scripts/
        │   ├── _config.sh        ← shared config reader
        │   ├── state-cli.sh
        │   ├── reconcile.sh
        │   ├── pr-monitor.sh
        │   └── ...
        ├── state/                 ← created at runtime
        ├── summaries/             ← created at runtime
        └── examples/
            ├── hooks.json
            └── hooks/
                ├── personal-dev-helper-state.sh
                ├── personal-session-summary.sh
                └── personal-shell-allowlist.sh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ERROR: Missing config file` | Ensure `dev-helper.config.json` exists in the skill root |
| `jq: command not found` | Install jq: `brew install jq` |
| `gh: command not found` | Install GitHub CLI: `brew install gh` then `gh auth login` |
| Hook not firing | Check `.cursor/hooks.json` paths are relative to workspace root |
| Jira 401 errors | Regenerate API token and update `~/.jira-creds` |
| Git remote errors | Run `git remote -v` and fix remote names to match config |
