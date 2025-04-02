import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';
import PlanStatus from 'src/views/plans/list/components/PlanRowFields/PlanStatus/PlanStatus';

import type { PlanDetailsItemProps } from './PlanDetailsItemProps';

export const StatusDetailsItem: FC<PlanDetailsItemProps> = ({ resource: plan }) => {
  const { t } = useForkliftTranslation();

  return (
    <DetailsItem
      title={t('Status')}
      helpContent={t('Migration plan state information and progress')}
      content={<PlanStatus plan={plan} />}
    />
  );
};
