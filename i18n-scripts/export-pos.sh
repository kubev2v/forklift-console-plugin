#!/bin/bash

set -exuo pipefail

source ./i18n-scripts/languages.sh

if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE=(sed -i '' -E)
else
  SED_INPLACE=(sed -i -r)
fi

for f in locales/en/* ; do
  for i in "${LANGUAGES[@]}"
  do
    npm run i18n-to-po -- -f "$(basename "$f" .json)" -l "$i"

    case $i in
      es) pattern='plural=(n != 1)' ;;
      fr) pattern='plural=(n >= 2)' ;;
      *) pattern='plural=0' ;;
    esac

    file="./po-files/$i/plugin__forklift-console-plugin.po"
    "${SED_INPLACE[@]}" "s|${pattern}|${pattern};|g" "$file"
    "${SED_INPLACE[@]}" 's|;;|;|g' "$file"

  done
done
