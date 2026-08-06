import { defineConfig } from 'i18next-cli';

export default defineConfig({
  extract: {
    defaultNS: 'plugin__forklift-console-plugin',
    // Use the 4th arg (extracted source string). For plurals, `key` is already
    // suffixed (`_one`/`_other`/…) while `value` is the unsuffixed base — returning
    // `key` leaked CLDR suffixes into secondary-locale placeholder values.
    defaultValue: (_key: string, _namespace: string, _language: string, value: string): string =>
      value,
    extractFromComments: true,
    functions: ['t', '*.t'],
    input: ['src/**/*.{js,jsx,ts,tsx}', 'plugin-extensions.ts'],
    keySeparator: false,
    nsSeparator: '~',
    output: 'locales/{{language}}/{{namespace}}.json',
    removeUnusedKeys: true,
    sort: true,
    transComponents: ['Trans', 'ForkliftTrans'],
    transKeepBasicHtmlNodesFor: [],
    useTranslationNames: ['useTranslation', 'useForkliftTranslation'],
  },
  locales: ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
});
