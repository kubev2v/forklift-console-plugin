# Personal Memsource setup

Copy this file once, then customize for your machine:

```bash
mkdir -p .cursor/skills/personal-i18n-memsource
cp .cursor/skills/i18n-memsource/personal-setup.example.md \
   .cursor/skills/personal-i18n-memsource/SETUP.md
```

`.cursor/skills/personal-i18n-memsource/` is gitignored. Do not commit SETUP.md.

---

## CLI path

Adjust for your Python / pip user install:

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
# binary example: $HOME/Library/Python/3.9/bin/memsource
```

Or use generic discovery:

```bash
MEMSOURCE_BIN=$(python3 -c "import shutil; print(shutil.which('memsource') or '')")
if [ -z "$MEMSOURCE_BIN" ]; then
  MEMSOURCE_BIN=$(find "$HOME/Library/Python" -name memsource -type f 2>/dev/null | head -1)
fi
export PATH="$(dirname "$MEMSOURCE_BIN"):$PATH"
```

## Credentials file

Typical setup: `~/.memsourcerc` exports `MEMSOURCE_USERNAME` and
`MEMSOURCE_PASSWORD`. Agents may **source** this file in the shell but must
**never** read its contents into chat context.

Optional in `~/.zshrc`:

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
[ -f "$HOME/.memsourcerc" ] && source "$HOME/.memsourcerc"
```

## Auth helper (optional — add to ~/.zshrc)

```bash
memsource-auth() {
  export MEMSOURCE_TOKEN="$(
    memsource auth login \
      --user-name "$MEMSOURCE_USERNAME" \
      --password "$MEMSOURCE_PASSWORD" \
      -f value -c token 2>/dev/null
  )"
  memsource auth whoami
}
```

## Agent auth sequence

When running upload/download/status from this machine:

```bash
# 1. Ensure memsource is on PATH (see CLI path above)
# 2. Source credentials without reading them into agent context
source ~/.memsourcerc
# 3. Obtain a short-lived token
export MEMSOURCE_TOKEN=$(memsource auth login \
  --user-name "$MEMSOURCE_USERNAME" \
  --password "$MEMSOURCE_PASSWORD" \
  -f value -c token 2>/dev/null)
# 4. Verify
memsource auth whoami
```

Or, if `memsource-auth` is defined in the shell: run `memsource-auth`.
