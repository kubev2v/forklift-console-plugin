---
name: i18n-memsource
description: Automates the Memsource/Phrase i18n translation workflow for OCP console plugins. Use when the user asks to upload translations, download translations, check translation status, memsource upload, memsource download, i18n upload, i18n download, send for translation, or get translations.
---

# i18n Memsource Workflow

Manages the full translation lifecycle: uploading strings to Memsource/Phrase, downloading translated files, creating PRs, and tracking status.

## State

Read `.cursor/skills/i18n-memsource/state.json` for current sprint, version, and project ID. Update it after each upload.

## Prerequisites

### Memsource CLI

The `memsource` CLI is a Python package (`memsource-cli`) installed via pip3. It
may not be on the default PATH. Locate and export it:

```bash
MEMSOURCE_BIN=$(python3 -c "import shutil; print(shutil.which('memsource') or '')")
if [ -z "$MEMSOURCE_BIN" ]; then
  MEMSOURCE_BIN=$(find "$HOME/Library/Python" -name memsource -type f 2>/dev/null | head -1)
fi
export PATH="$(dirname "$MEMSOURCE_BIN"):$PATH"
```

### Authentication (credentials stay with the user)

**Do not** read `~/.memsourcerc`, Memsource passwords, or long-lived tokens into
the agent context. Phrase is a paid external service — treat credentials like
any other secret.

Preferred flow:

1. Ask the user to authenticate in **their own terminal** and confirm
   `memsource auth whoami` works (and that `MEMSOURCE_TOKEN` is exported in the
   shell they will use for `npm run memsource-*`).
2. The agent may run extract/export/validation without credentials
   (`npm run i18n`, `npm run export-pos`, PO checks).
3. For upload/download/status, either:
   - the user runs the `memsource-*` / `memsource job list` commands themselves
     after the agent prepares artifacts, or
   - the user has already exported a **short-lived** `MEMSOURCE_TOKEN` in the
     shared shell (never paste the password into chat).

If a shared shell already has `MEMSOURCE_TOKEN`, verify with:

```bash
memsource auth whoami
```

If auth fails, stop and ask the user to refresh the token outside the agent.
Also ensure `jq` is installed (`brew install jq`) — upload scripts need it.

### Config

Read `i18n-scripts.config.json` from the project root for plugin config
(languages, plugin name, language aliases, etc).

---

## Action 1: Upload Translations

Trigger: user says "upload translations", "memsource upload", "i18n upload", "send for translation"

### Checklist

```
Upload Progress:
- [ ] Step 1: Load config and state
- [ ] Step 2: Get VERSION from user, auto-increment SPRINT
- [ ] Step 3: Authenticate with Memsource
- [ ] Step 4: Extract translation keys
- [ ] Step 5: Generate PO files
- [ ] Step 6: Validate PO files
- [ ] Step 7: Show summary and get approval
- [ ] Step 8: Upload to Memsource
- [ ] Step 9: Update state and show results
```

### Step 1: Load config and state

Read these files:
- `i18n-scripts.config.json` -- for `pluginName`, `languages`, `languageAliases`
- `.cursor/skills/i18n-memsource/state.json` -- for current `sprint`, `version`, `lastProjectId`

### Step 2: Get VERSION and SPRINT

- Always ask the user for VERSION using the AskQuestion tool. Do not assume.
- Auto-increment SPRINT from state.json (previous sprint + 1).
- Show the user: "Uploading VERSION X, Sprint Y (branch: Z)"

### Step 3: Authenticate

Confirm Memsource auth is available without loading credentials into the agent
(see Prerequisites). Prefer asking the user to auth in their terminal.

If a shared shell already has `MEMSOURCE_TOKEN`, verify with:

```bash
memsource auth whoami
```

If it fails, stop and ask the user to refresh the token outside the agent.

### Step 4: Extract translation keys

```bash
npm run i18n
```

Verify it exits with code 0 and writes locale files.

### Step 5: Generate PO files

```bash
rm -rf po-files
npm run export-pos
```

The script resolves `languageAliases` from `i18n-scripts.config.json` automatically
(e.g. `zh-cn` maps to locale directory `zh/`). Fixed in `ocp-plugin-i18n-scripts@1.0.2`.

### Step 6: Validate PO files

For each language directory in `po-files/`, check the PO file:

1. **Count entries**: grep for `^msgid ` (excluding the header empty msgid) to count total keys
2. **Check msgstr values**: for each entry, `msgstr` should be either:
   - Empty (`msgstr ""`) -- new/untranslated content (correct)
   - Non-English text -- real translations from previous cycles (correct)
   - English text identical to msgid -- PROBLEM: placeholder leaking through
3. **Verify plural headers**: check that the `Plural-Forms` header exists and has the trailing semicolon
4. **Compare sizes**: all PO files should be roughly similar in size (large discrepancy may indicate an issue)

Report findings per language:
```
Validation Results:
- ja: 720 keys, all msgstr empty (ready for translation)
- zh-cn: 720 keys, all msgstr empty (ready for translation)
- ko: 720 keys, all msgstr empty (ready for translation)
- fr: 720 keys, 500 translated + 220 new (carrying forward existing)
- es: 720 keys, 500 translated + 220 new (carrying forward existing)
```

Flag any anomalies. If English text is found in msgstr where it shouldn't be, warn the user.

### Step 7: Show summary and get approval

Present to the user:
- Version and Sprint
- Current branch name
- Number of keys per language
- Validation results
- The Memsource project title that will be created

Ask for explicit approval before proceeding. Use the AskQuestion tool:
- "Approve upload" / "Cancel"

### Step 8: Upload to Memsource

Run the upload only when `MEMSOURCE_TOKEN` is already available in the shell
(user-provided; never sourced by the agent from `~/.memsourcerc`):

```bash
npm run memsource-upload -- -v VERSION -s SPRINT
```

Alternatively, have the user run that command themselves after Steps 4–7.

The script handles branch names with `/` and resolves language aliases
automatically (fixed in `ocp-plugin-i18n-scripts@1.0.2`).

Capture the output. The script prints the PROJECT_ID in JSON. Extract the `uid`
field from the `memsource project create` output.

If the upload fails (auth error, network error), report the error and suggest fixes.

### Step 9: Update state and show results

Update `.cursor/skills/i18n-memsource/state.json`:
- Set `sprint` to the new sprint number
- Set `version` to the provided version
- Set `lastProjectId` to the new PROJECT_ID
- Set `memsourceProjectUrl` to `https://cloud.memsource.com/web/project2/show/PROJECT_ID`
- Append to `history` array: `{ "sprint": N, "version": "X.Y", "projectId": "...", "date": "YYYY-MM-DD" }`

Show the user:
- The Memsource project URL
- The PROJECT_ID for reference
- A draft notification message:

```
Subject: [Forklift VERSION] Translation Upload - Sprint SPRINT

Hi Localization Team,

New translation strings have been uploaded for Forklift VERSION (Sprint SPRINT).

Memsource project: https://cloud.memsource.com/web/project2/show/PROJECT_ID

Languages: ja, zh-cn, ko, fr, es
Total keys: N

Please review and translate at your convenience. Let us know when translations are ready for download.

Thanks
```

---

## Action 2: Download Translations and Create PR

Trigger: user says "download translations", "memsource download", "i18n download", "get translations"

### Checklist

```
Download Progress:
- [ ] Step 1: Load state and get PROJECT_ID
- [ ] Step 2: Authenticate with Memsource
- [ ] Step 3: Check translation status
- [ ] Step 4: Download translations
- [ ] Step 5: Show diff summary
- [ ] Step 6: Create PR
```

### Step 1: Load state and get PROJECT_ID

Read `.cursor/skills/i18n-memsource/state.json` for `lastProjectId`. Show it to the user and ask if they want to use it or provide a different one.

### Step 2: Authenticate

Confirm Memsource auth is available without loading credentials into the agent
(see Prerequisites). Prefer asking the user to auth in their terminal, or verify
an already-exported `MEMSOURCE_TOKEN` with `memsource auth whoami`.

### Step 3: Check translation status

For each language in the config, run:
```bash
memsource job list --project-id PROJECT_ID --target-lang LANG -f json
```

Show completion status. If translations aren't ready, warn the user and ask if they want to proceed anyway.

### Step 4: Download translations

The memsource-download script checks for a clean git workspace on locales. If there are uncommitted locale changes, commit or stash them first.

```bash
npm run memsource-download -- -p PROJECT_ID
```

This downloads, converts PO to JSON, and auto-commits.

### Step 5: Show diff summary

Run `git diff HEAD~1 --stat -- locales/` to show what changed. Summarize:
- Number of files changed
- Languages updated
- Approximate number of new/changed translations

### Step 6: Create PR

```bash
git checkout -b chore/i18n-update-sprint-SPRINT
git push -u origin HEAD
gh pr create --title "chore(i18n): update translations for Sprint SPRINT" --body "$(cat <<'EOF'
## Summary
- Downloaded translations from Memsource project PROJECT_ID
- Languages: ja, zh-cn, ko, fr, es

## Memsource Project
https://cloud.memsource.com/web/project2/show/PROJECT_ID

## Test plan
- [ ] Verify locale files are valid JSON
- [ ] Spot-check translations in the UI

Resolves: None
EOF
)"
```

Show the PR URL to the user.

---

## Action 3: Check Translation Status

Trigger: user says "translation status", "memsource status", "check translations"

### Steps

1. Read `.cursor/skills/i18n-memsource/state.json` for `lastProjectId`
2. Ask user to confirm or provide a different PROJECT_ID
3. Confirm Memsource auth is available without loading credentials into the
   agent (see Prerequisites). Prefer user-owned auth, or verify an already-
   exported `MEMSOURCE_TOKEN` with `memsource auth whoami`.
4. For each language in `i18n-scripts.config.json`, query:
   ```bash
   memsource job list --project-id PROJECT_ID --target-lang LANG -f json -c uid,status,targetLang
   ```
5. Display a status table:
   ```
   Translation Status for PROJECT_ID:
   | Language | Status      | Jobs |
   |----------|-------------|------|
   | ja       | In Progress | 1    |
   | zh-cn    | Completed   | 1    |
   | ko       | In Progress | 1    |
   | fr       | Completed   | 1    |
   | es       | Completed   | 1    |
   ```
6. If all languages are completed, suggest running Action 2 (download).

---

## Important Notes

- **CLI path:** The `memsource` binary is installed via pip3 and may not be on PATH. Use the discovery snippet from Prerequisites to locate it.
- **Auth token:** Never source `~/.memsourcerc` or read passwords into the agent. Upload/download need a user-exported short-lived `MEMSOURCE_TOKEN` in the shell (or the user runs `memsource-*` themselves).
- **Language aliases and branch names:** Both are handled automatically since `ocp-plugin-i18n-scripts@1.0.2`. No symlinks or branch switching needed.
- The `npm run memsource-upload` and `npm run memsource-download` scripts use the `ocp-plugin-i18n-scripts` npm package CLI commands under the hood.
- PO files are temporary artifacts in `po-files/` -- they're cleaned up after upload.
- The `memsource-download` script auto-commits. The PR creation is a separate step.
- State file should always be kept up to date after uploads.
