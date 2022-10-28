/**
 * Mock tranlation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
export const useTranslation = () => ({
  t: (k: string) => k,
  i18n: {
    resolvedLanguage: 'en',
  },
});
