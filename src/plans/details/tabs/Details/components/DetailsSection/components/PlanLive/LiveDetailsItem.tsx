import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';
import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanLive from './EditPlanLive';

const LiveDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const migrationType = getPlanMigrationType(plan);
  return (
    <DetailsItem
      testId="migration-type-detail-item"
      title={t('Migration type')}
      content={<PlanMigrationTypeLabel migrationType={migrationType} />}
      helpContent={t('Whether this is a live migration.')}
      crumbs={['spec', 'type']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanLive, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default LiveDetailsItem;
