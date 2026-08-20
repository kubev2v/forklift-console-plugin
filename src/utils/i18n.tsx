/* eslint-disable react-refresh/only-export-components */
import type { FC, ReactNode } from 'react';
import { getI18n, Trans, useTranslation } from 'react-i18next';
import type { TOptions } from 'i18next';

export const useForkliftTranslation = (): ReturnType<typeof useTranslation> => {
  return useTranslation('plugin__forklift-console-plugin');
};

export const ForkliftTrans: FC<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useForkliftTranslation();

  return (
    <Trans ns="plugin__forklift-console-plugin" t={t}>
      {children}
    </Trans>
  );
};

/**
 * Performs translation to 'plugin__forklift-console-plugin' namespace for usage outside of component functions.
 * @param value string to translate
 * @param options (optional) options for translations
 */
export const t = (value: string, options?: TOptions): string =>
  getI18n().t(value, { ns: 'plugin__forklift-console-plugin', ...options });
