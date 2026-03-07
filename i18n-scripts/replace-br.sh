#!/bin/bash

LOCALE_FILES=(
  ./locales/en/plugin__forklift-console-plugin.json
  ./locales/es/plugin__forklift-console-plugin.json
  ./locales/fr/plugin__forklift-console-plugin.json
  ./locales/ja/plugin__forklift-console-plugin.json
  ./locales/ko/plugin__forklift-console-plugin.json
  ./locales/zh/plugin__forklift-console-plugin.json
)

EXISTING_FILES=()
for f in "${LOCALE_FILES[@]}"; do
  if [ -f "$f" ]; then
    EXISTING_FILES+=("$f")
  fi
done

if [ ${#EXISTING_FILES[@]} -gt 0 ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -E "s| | |g" "${EXISTING_FILES[@]}"
  else
    sed -i -r "s| | |g" "${EXISTING_FILES[@]}"
  fi
fi
