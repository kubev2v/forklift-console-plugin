import React from 'react';
import { PlanSummaryStatus } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils';

import { Label } from '@patternfly/react-core';

type PlanStatusCellLabelProps = {
  status: PlanSummaryStatus;
};

export const PlanStatusCellLabel: React.FC<PlanStatusCellLabelProps> = ({ status }) => {
  const { t } = useForkliftTranslation();

  if (!status) {
    return t('Validating...');
  }

  return (
    <Label
      isCompact
      variant={
        status === PlanSummaryStatus.Incomplete || status === PlanSummaryStatus.CannotStart
          ? 'filled'
          : 'outline'
      }
    >
      {status}
    </Label>
  );
};
