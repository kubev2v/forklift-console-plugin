import type { ReactElement } from 'react';

/**
 * Mock translation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
export const useTranslation = (): {
  i18n: { resolvedLanguage: string };
  t: (key: string) => string;
} => ({
  i18n: {
    resolvedLanguage: 'en',
  },
  t: (key: string): string => key,
});

export const getI18n = (): { t: (key: string) => string } => ({
  t: (key: string): string => key,
});

export const Trans = (): ReactElement => <div data-test-element-name="Trans" />;
