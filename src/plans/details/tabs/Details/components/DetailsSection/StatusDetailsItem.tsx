import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import PlanStatus from 'src/plans/list/components/PlanRowFields/PlanStatus/PlanStatus';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

type StatusDetailsItemProps = {
  plan: V1beta1Plan;
};

const StatusDetailsItem: FC<StatusDetailsItemProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  return (
    <DetailsItem
      testId="status-detail-item"
      title={t('Status')}
      helpContent={t('Migration plan state information and progress')}
      content={<PlanStatus plan={plan} />}
    />
  );
};

export default StatusDetailsItem;
