import type { UserConfig } from 'i18next-parser';

const CustomJSONLexer = {
  extract(content: string): { key: string }[] {
    const keys: { key: string }[] = [];
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const scan = (obj: unknown): void => {
        if (typeof obj === 'string') {
          const match = /^%(?<key>.+)%$/u.exec(obj);
          if (match?.groups?.key) {
            keys.push({ key: match.groups.key });
          }
        } else if (Array.isArray(obj)) {
          obj.forEach(scan);
        } else if (obj && typeof obj === 'object') {
          Object.values(obj).forEach(scan);
        }
      };
      scan(parsed);
    } catch {
      // not valid JSON, skip
    }
    return keys;
  },
};

const config: UserConfig = {
  createOldCatalogs: false,
  defaultNamespace: 'plugin__forklift-console-plugin',
  defaultValue(_locale, _namespace, key: string | undefined): string {
    return key ?? '';
  },
  keySeparator: false,
  lexers: {
    default: ['JsxLexer'],
    json: [CustomJSONLexer] as unknown as UserConfig['lexers'],
    tsx: [
      {
        componentFunctions: ['Trans', 'ForkliftTrans'],
        lexer: 'JsxLexer',
      },
    ],
  } as UserConfig['lexers'],
  locales: ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  namespaceSeparator: '~',
  sort: true,
};

export default config;
