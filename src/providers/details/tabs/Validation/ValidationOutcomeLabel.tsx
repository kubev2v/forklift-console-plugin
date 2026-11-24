import type { FC, ReactElement } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { ValidationOutcome } from 'src/virtualizationValidation/types';

import { Icon, Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';

type ValidationOutcomeLabelProps = {
  outcome: ValidationOutcome;
};

type OutcomeConfig = {
  color?: 'green' | 'grey' | 'red';
  icon: ReactElement;
};

const getOutcomeConfig = (outcome: ValidationOutcome): OutcomeConfig => {
  switch (outcome) {
    case 'Passed':
      return { color: 'green', icon: <CheckCircleIcon /> };
    case 'Error':
    case 'Failed':
    case 'TimedOut':
      return { color: 'red', icon: <ExclamationCircleIcon /> };
    case 'Pending':
    case 'Running':
      return { color: 'grey', icon: <InProgressIcon /> };
    default:
      return { icon: <MinusCircleIcon /> };
  }
};

const ValidationOutcomeLabel: FC<ValidationOutcomeLabelProps> = ({ outcome }) => {
  const { t } = useForkliftTranslation();
  const { color, icon } = getOutcomeConfig(outcome);

  return (
    <Label color={color} icon={<Icon isInline>{icon}</Icon>}>
      {t(outcome)}
    </Label>
  );
};

export default ValidationOutcomeLabel;
