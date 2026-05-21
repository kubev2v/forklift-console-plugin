import { type ReactNode, useMemo } from 'react';

import { STATUS_ICONS } from '@components/status/statusIcons';
import { Spinner } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

const progressIcon = () => <Spinner size="sm" />;

export const useStatusPhaseValues = (
  phase?: string,
): { phaseLabel: string; phaseIcon: ReactNode } => {
  const { t } = useForkliftTranslation();

  return useMemo(() => {
    switch (phase) {
      case CATEGORY_TYPES.CONNECTION_FAILED:
        return { phaseIcon: STATUS_ICONS.danger, phaseLabel: t('Connection Failed') };
      case CATEGORY_TYPES.CRITICAL:
        return { phaseIcon: STATUS_ICONS.danger, phaseLabel: t('Critical') };
      case CATEGORY_TYPES.NOT_READY:
        return { phaseIcon: progressIcon(), phaseLabel: t('Not Ready') };
      case CATEGORY_TYPES.STAGING:
        return { phaseIcon: progressIcon(), phaseLabel: t('Staging') };
      case CATEGORY_TYPES.VALIDATION_FAILED:
        return { phaseIcon: STATUS_ICONS.danger, phaseLabel: t('Validation Failed') };
      case CATEGORY_TYPES.READY:
      case undefined:
        return { phaseIcon: STATUS_ICONS.success, phaseLabel: t('Ready') };
      default:
        return { phaseIcon: null, phaseLabel: t('Undefined') };
    }
  }, [phase, t]);
};
