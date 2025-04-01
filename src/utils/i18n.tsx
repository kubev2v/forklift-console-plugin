import React, { type ReactNode } from 'react';
import { getI18n, Trans, useTranslation } from 'react-i18next';
import type { TranslationOptions } from 'i18next';

export function useForkliftTranslation() {
  return useTranslation('plugin__forklift-console-plugin');
}

export const ForkliftTrans: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useForkliftTranslation();

  return (
    <Trans t={t} ns="plugin__forklift-console-plugin">
      {children}
    </Trans>
  );
};

/**
 * Performs translation to 'plugin__forklift-console-plugin' namespace for usage outside of component functions.
 * @param value string to translate
 * @param options (optional) options for translations
 */
export const t = (value: string, options?: TranslationOptions) =>
  getI18n().t(value, { ns: 'plugin__forklift-console-plugin', ...options });
