import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function useForkliftTranslation() {
  return useTranslation('plugin__forklift-console-plugin');
}

export const ForkliftTrans: React.FC = ({ children }) => {
  const { t } = useForkliftTranslation();

  return (
    <Trans t={t} ns="plugin__forklift-console-plugin">
      {children}
    </Trans>
  );
};
