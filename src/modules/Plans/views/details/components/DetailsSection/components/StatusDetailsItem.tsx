import React from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { PlanDetailsItemProps } from './PlanDetailsItemProps';
import PlanStatus from 'src/views/plans/list/components/RowCells/PlanStatus/PlanStatus';

export const StatusDetailsItem: React.FC<PlanDetailsItemProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();

  return (
    <DetailsItem
      title={t('Status')}
      helpContent={t('Migration plan state information and progress')}
      content={<PlanStatus data={{ plan: resource }} fieldId={''} />}
    />
  );
};
