import type { UserConfig } from 'i18next-parser';

const config: UserConfig = {
  createOldCatalogs: false,
  defaultNamespace: 'plugin__forklift-console-plugin',
  defaultValue(_locale, _namespace, key: string | undefined): string {
    return key ?? '';
  },
  keySeparator: false,
  lexers: {
    tsx: [
      {
        componentFunctions: ['Trans', 'ForkliftTrans'],
        lexer: 'JsxLexer',
      },
    ],
  },
  locales: ['en'],
  namespaceSeparator: '~',
  sort: true,
};

export default config;
