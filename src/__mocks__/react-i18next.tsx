import React from 'react';

/**
 * Mock translation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
export const useTranslation = () => ({
  i18n: {
    resolvedLanguage: 'en',
  },
  t: (k: string) => k,
});

export const Trans = () => <div data-test-element-name="Trans" />;
