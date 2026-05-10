import type { FC } from 'react';

import { Icon, Label } from '@patternfly/react-core';
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

type ConversionPhaseLabelProps = {
  phase: ConversionPhase | undefined;
};

type PhaseConfig = {
  icon: JSX.Element;
  label: string;
  labelStatus?: 'danger' | 'info' | 'success' | 'warning';
};

const getPhaseConfig = (
  phase: ConversionPhase | undefined,
  t: ReturnType<typeof useForkliftTranslation>['t'],
): PhaseConfig => {
  switch (phase) {
    case CONVERSION_PHASE.SUCCEEDED:
      return { icon: <CheckCircleIcon />, label: t('Succeeded'), labelStatus: 'success' };
    case CONVERSION_PHASE.FAILED:
      return { icon: <ExclamationCircleIcon />, label: t('Failed'), labelStatus: 'danger' };
    case CONVERSION_PHASE.CANCELED:
      return { icon: <BanIcon />, label: t('Canceled') };
    case CONVERSION_PHASE.RUNNING:
      return { icon: <InProgressIcon />, label: t('Running'), labelStatus: 'info' };
    case CONVERSION_PHASE.PENDING:
    case undefined:
    default:
      return { icon: <MinusCircleIcon />, label: t('Pending') };
  }
};

const ConversionPhaseLabel: FC<ConversionPhaseLabelProps> = ({ phase }) => {
  const { t } = useForkliftTranslation();
  const config = getPhaseConfig(phase, t);

  return (
    <Label variant="filled" status={config.labelStatus} icon={<Icon isInline>{config.icon}</Icon>}>
      {config.label}
    </Label>
  );
};

export default ConversionPhaseLabel;
