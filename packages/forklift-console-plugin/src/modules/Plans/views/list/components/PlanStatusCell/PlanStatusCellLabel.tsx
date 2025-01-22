import React from 'react';
import { PlanSummaryStatus } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils';

import { Label, Spinner } from '@patternfly/react-core';

interface PlanStatusCellLabelProps {
  status: PlanSummaryStatus;
  isLoading: boolean;
}

export const PlanStatusCellLabel: React.FC<PlanStatusCellLabelProps> = ({ status, isLoading }) => {
  const { t } = useForkliftTranslation();

  if (isLoading) {
    return <Spinner size="md" />;
  }

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
