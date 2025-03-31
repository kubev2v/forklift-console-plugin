import React from 'react';
import { PlanStatusCell } from 'src/modules/Plans/views/list';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { PlanDetailsItemProps } from './PlanDetailsItemProps';

export const StatusDetailsItem: React.FC<PlanDetailsItemProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();

  return (
    <DetailsItem
      title={t('Status')}
      helpContent={t('Migration plan state information and progress')}
      content={<PlanStatusCell data={{ obj: resource }} fieldId={''} fields={[]} />}
    />
  );
};
