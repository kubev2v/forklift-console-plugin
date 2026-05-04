import type { FC, ReactNode } from 'react';

import { Icon, Label, Popover, Timestamp } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { CONVERSION_PHASE } from '@utils/crds/conversion/constants';
import type { ConversionPhase } from '@utils/crds/conversion/types';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionStatusLabelProps = {
  phase: ConversionPhase | undefined;
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
  phase: ConversionPhase,
  t: ReturnType<typeof useForkliftTranslation>['t'],
): StatusConfig => {
  switch (phase) {
    case CONVERSION_PHASE.SUCCEEDED:
      return {
        icon: (
          <Icon isInline status="success">
            <CheckCircleIcon />
          </Icon>
        ),
        label: t('Completed'),
        labelStatus: 'success',
        showTimestamp: true,
      };
    case CONVERSION_PHASE.FAILED:
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
    case CONVERSION_PHASE.CANCELED:
      return {
        icon: (
          <Icon isInline>
            <BanIcon />
          </Icon>
        ),
        label: t('Canceled'),
        showTimestamp: true,
      };
    case CONVERSION_PHASE.RUNNING:
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
    case CONVERSION_PHASE.PENDING:
    default:
      return {
        icon: (
          <Icon isInline>
            <MinusCircleIcon />
          </Icon>
        ),
        label: t('Pending'),
        showTimestamp: false,
      };
  }
};

const InspectionStatusLabel: FC<InspectionStatusLabelProps> = ({ phase, testId, timestamp }) => {
  const { t } = useForkliftTranslation();

  if (!phase) {
    return (
      <Label isCompact variant="outline" data-testid={testId}>
        {t('Not inspected')}
      </Label>
    );
  }

  const config = getStatusConfig(phase, t);

  const label = (
    <Label
      isCompact
      variant="outline"
      status={config.labelStatus}
      icon={config.icon}
      data-testid={testId}
    >
      {config.label}
    </Label>
  );

  if (timestamp && config.showTimestamp) {
    return (
      <Popover triggerAction="hover" bodyContent={<Timestamp date={new Date(timestamp)} />}>
        {label}
      </Popover>
    );
  }

  return label;
};

export default InspectionStatusLabel;
