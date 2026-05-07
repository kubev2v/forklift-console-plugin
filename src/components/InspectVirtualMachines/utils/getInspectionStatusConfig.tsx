import type { ReactNode } from 'react';

import { Icon } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import type { useForkliftTranslation } from '@utils/i18n';

export type InspectionStatusConfig = {
  icon: ReactNode;
  label: string;
  labelStatus?: 'custom' | 'danger' | 'info' | 'success' | 'warning';
};

export const getInspectionStatusConfig = (
  status: InspectionStatus,
  t: ReturnType<typeof useForkliftTranslation>['t'],
): InspectionStatusConfig => {
  switch (status) {
    case INSPECTION_STATUS.INSPECTION_PASSED:
      return {
        icon: (
          <Icon isInline status="success">
            <CheckCircleIcon />
          </Icon>
        ),
        label: t('Inspection passed'),
        labelStatus: 'success',
      };
    case INSPECTION_STATUS.ISSUES_FOUND:
      return {
        icon: (
          <Icon isInline status="warning">
            <ExclamationTriangleIcon />
          </Icon>
        ),
        label: t('Issues found'),
        labelStatus: 'warning',
      };
    case INSPECTION_STATUS.FAILED:
      return {
        icon: (
          <Icon isInline status="danger">
            <ExclamationCircleIcon />
          </Icon>
        ),
        label: t('Failed'),
        labelStatus: 'danger',
      };
    case INSPECTION_STATUS.RUNNING:
      return {
        icon: (
          <Icon isInline>
            <InProgressIcon />
          </Icon>
        ),
        label: t('Running'),
        labelStatus: 'info',
      };
    case INSPECTION_STATUS.PENDING:
      return {
        icon: (
          <Icon isInline>
            <MinusCircleIcon />
          </Icon>
        ),
        label: t('Pending'),
      };
    case INSPECTION_STATUS.CANCELED:
      return {
        icon: (
          <Icon isInline>
            <BanIcon />
          </Icon>
        ),
        label: t('Canceled'),
      };
    case INSPECTION_STATUS.NOT_INSPECTED:
    default:
      return {
        icon: undefined,
        label: t('Not inspected'),
      };
  }
};
