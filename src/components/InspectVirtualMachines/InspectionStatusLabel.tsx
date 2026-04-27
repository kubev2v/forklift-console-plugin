import type { FC, ReactNode } from 'react';

import { Flex, FlexItem, Icon, Label, Timestamp } from '@patternfly/react-core';
import {
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
    case CONVERSION_PHASE.CREATING_POD:
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

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapSm' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem>
        <Label
          isCompact
          variant="filled"
          status={config.labelStatus}
          icon={config.icon}
          data-testid={testId}
        >
          {config.label}
        </Label>
      </FlexItem>
      {timestamp && config.showTimestamp && (
        <FlexItem>
          <Timestamp date={new Date(timestamp)} />
        </FlexItem>
      )}
    </Flex>
  );
};

export default InspectionStatusLabel;
