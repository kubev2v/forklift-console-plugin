import React from 'react';

/**
 * Mock translation utility
 */
export const useTranslation = () => ({
  t: (key, options) => {
    // Resolve interpolated strings
    if (options?.interpolation || options?.total || options?.count) {
      const interpolatedString = key.replace(/{{(\w+)}}/g, (match, variable) => {
        return options[variable] || options.interpolation?.[variable] || match;
      });

      return interpolatedString;
    } else {
      return key;
    }
  },
  i18n: {
    resolvedLanguage: 'en',
  },
});

export const Trans = () => <div data-test-element-name="Trans" />;
