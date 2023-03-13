import React from 'react';

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

export const Trans = () => <div data-test-element-name="Trans" />;
