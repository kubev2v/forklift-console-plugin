import type { FC, ReactNode } from 'react';

import { Icon, Label } from '@patternfly/react-core';
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
import { useForkliftTranslation } from '@utils/i18n';

type InspectionStatusLabelProps = {
  status: InspectionStatus;
  testId?: string;
  timestamp?: string;
};

type StatusConfig = {
  icon: ReactNode;
  label: string;
  labelStatus?: 'custom' | 'danger' | 'info' | 'success' | 'warning';
  showTimestamp: boolean;
};

const getStatusConfig = (
  status: InspectionStatus,
  t: ReturnType<typeof useForkliftTranslation>['t'],
): StatusConfig => {
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
        showTimestamp: true,
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
        showTimestamp: true,
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
        showTimestamp: true,
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
        showTimestamp: false,
      };
    case INSPECTION_STATUS.PENDING:
      return {
        icon: (
          <Icon isInline>
            <MinusCircleIcon />
          </Icon>
        ),
        label: t('Pending'),
        showTimestamp: false,
      };
    case INSPECTION_STATUS.CANCELED:
      return {
        icon: (
          <Icon isInline>
            <BanIcon />
          </Icon>
        ),
        label: t('Canceled'),
        showTimestamp: true,
      };
    case INSPECTION_STATUS.NOT_INSPECTED:
    default:
      return {
        icon: undefined,
        label: t('Not inspected'),
        showTimestamp: false,
      };
  }
};

const InspectionStatusLabel: FC<InspectionStatusLabelProps> = ({ status, testId, timestamp }) => {
  const { t } = useForkliftTranslation();
  const config = getStatusConfig(status, t);

  return (
    <Label variant="outline" status={config.labelStatus} icon={config.icon} data-testid={testId}>
      {config.label}
    </Label>
  );
};

export default InspectionStatusLabel;
