import { defineConfig } from 'i18next-cli';

export default defineConfig({
  extract: {
    defaultNS: 'plugin__forklift-console-plugin',
    defaultValue: (key: string): string => key,
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
