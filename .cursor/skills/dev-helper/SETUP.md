# Dev-Helper Skill Setup

Complete setup guide for the `dev-helper` Cursor skill.

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

### Verify Jira access

```bash
source ~/.jira-creds
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "https://redhat.atlassian.net/rest/api/2/myself" | jq .displayName
```

---

## 2. Configuration File

The skill reads project settings from `dev-helper.config.json` in the skill root.

Copy and customize:

```bash
cd .cursor/skills/dev-helper
cp dev-helper.config.example.json dev-helper.config.json
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

---

## 3. Cursor Hooks

Hooks provide session-level automation (context injection, session logging, shell approval).

### Copy hook scripts

```bash
cp .cursor/skills/dev-helper/examples/hooks/*.sh .cursor/hooks/
chmod +x .cursor/hooks/dev-helper-state.sh
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
      "script": ".cursor/hooks/dev-helper-state.sh",
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

## 4. Verify Setup

Run these commands to confirm everything works:

```bash
# 1. Config file is parseable
jq . .cursor/skills/dev-helper/dev-helper.config.json

# 2. Config reader works
source .cursor/skills/dev-helper/scripts/_config.sh
echo "Project: $JIRA_PROJECT_KEY | Repo: $GH_REPO"

# 3. Jira access
source ~/.jira-creds
curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_BASE_URL}/rest/api/2/myself" | jq .displayName

# 4. GitHub CLI
gh repo view "$GH_REPO" --json name -q .name

# 5. Hooks are executable
.cursor/hooks/dev-helper-state.sh
.cursor/hooks/personal-shell-allowlist.sh <<< '{"command": "echo test"}'
```

---

## Directory Structure After Setup

```
.cursor/
├── hooks/
│   ├── hooks.json
│   ├── dev-helper-state.sh
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
                ├── dev-helper-state.sh
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
