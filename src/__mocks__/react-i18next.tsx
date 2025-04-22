/**
 * Mock translation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
export const useTranslation = () => ({
  i18n: {
    resolvedLanguage: 'en',
  },
  t: (key: string) => key,
});

export const Trans = () => <div data-test-element-name="Trans" />;
