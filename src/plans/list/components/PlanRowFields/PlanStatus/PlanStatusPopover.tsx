import type { FC, ReactElement } from 'react';
import MigrationPerformanceDetails from 'src/plans/details/components/PlanStatus/MigrationPerformanceDetails';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { Popover } from '@patternfly/react-core';
import { getPlanMigrationPerformance } from '@utils/migrations/migrationPerformance';

type PlanStatusPopoverProps = {
  children: ReactElement;
  plan: V1beta1Plan;
};

const PlanStatusPopover: FC<PlanStatusPopoverProps> = ({ children, plan }) => {
  const { t } = useForkliftTranslation();
  const performance = getPlanMigrationPerformance(plan);

  if (!performance) {
    return children;
  }

  return (
    <Popover
      bodyContent={<MigrationPerformanceDetails performance={performance} />}
      headerContent={t('Last migration')}
      position="right"
      showClose={false}
      triggerAction="hover"
    >
      {children}
    </Popover>
  );
};

export default PlanStatusPopover;
