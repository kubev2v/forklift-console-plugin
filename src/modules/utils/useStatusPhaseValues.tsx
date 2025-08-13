import type { ReactNode } from 'react';

import { Spinner } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n.tsx';

export const useStatusPhaseValues = (
  phase?: string,
): { phaseLabel: string; phaseIcon: ReactNode } => {
  const { t } = useForkliftTranslation();

  switch (phase) {
    case 'Critical':
      return { phaseIcon: <ExclamationCircleIcon color="#C9190B" />, phaseLabel: t('Critical') };
    case 'Not Ready':
      return { phaseIcon: <Spinner size="sm" />, phaseLabel: t('Not Ready') };
    case 'Ready':
    case undefined:
      return { phaseIcon: <CheckCircleIcon color="#3E8635" />, phaseLabel: t('Ready') };
    default:
      return { phaseIcon: null, phaseLabel: t('Undefined') };
  }
};
