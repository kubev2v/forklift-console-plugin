import { type ReactNode, useMemo } from 'react';

import { Icon, Spinner } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { CATEGORY_TYPES } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

const errorIcon = () => (
  <Icon status="danger">
    <ExclamationCircleIcon />
  </Icon>
);
const progressIcon = () => <Spinner size="sm" />;
const readyIcon = () => (
  <Icon status="success">
    <CheckCircleIcon />
  </Icon>
);

export const useStatusPhaseValues = (
  phase?: string,
): { phaseLabel: string; phaseIcon: ReactNode } => {
  const { t } = useForkliftTranslation();

  return useMemo(() => {
    switch (phase) {
      case CATEGORY_TYPES.CONNECTION_FAILED:
        return { phaseIcon: errorIcon(), phaseLabel: t('Connection Failed') };
      case CATEGORY_TYPES.CRITICAL:
        return { phaseIcon: errorIcon(), phaseLabel: t('Critical') };
      case CATEGORY_TYPES.NOT_READY:
        return { phaseIcon: progressIcon(), phaseLabel: t('Not Ready') };
      case CATEGORY_TYPES.STAGING:
        return { phaseIcon: progressIcon(), phaseLabel: t('Staging') };
      case CATEGORY_TYPES.VALIDATION_FAILED:
        return { phaseIcon: errorIcon(), phaseLabel: t('Validation Failed') };
      case CATEGORY_TYPES.READY:
      case undefined:
        return { phaseIcon: readyIcon(), phaseLabel: t('Ready') };
      default:
        return { phaseIcon: null, phaseLabel: t('Undefined') };
    }
  }, [phase, t]);
};
