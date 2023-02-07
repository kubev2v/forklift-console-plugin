#!/usr/bin/env bash

npm run i18n
GIT_STATUS="$(git status --short --untracked-files -- packages/forklift-console-plugin/locales)"
if [ -n "$GIT_STATUS" ]; then
  echo "i18n files are not up to date. Commit them to fix."
  git diff
  exit 1
fi