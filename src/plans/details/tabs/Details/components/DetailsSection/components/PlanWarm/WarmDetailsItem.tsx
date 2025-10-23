import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanWarm from './EditPlanWarm';

const WarmDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const migrationType = getPlanMigrationType(plan);
  return (
    <DetailsItem
      title={t('Migration type')}
      content={<PlanMigrationTypeLabel migrationType={migrationType} />}
      helpContent={t('Whether this is a warm migration.')}
      crumbs={['spec', 'warm']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanWarm, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default WarmDetailsItem;
