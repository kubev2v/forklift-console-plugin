import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanMigrationType from './EditPlanMigrationType';

const MigrationTypeDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  isVddkInitImageNotSet,
  plan,
  shouldRender,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const migrationType = getPlanMigrationType(plan);

  return (
    <DetailsItem
      testId="migration-type-detail-item"
      title={t('Migration type')}
      content={<PlanMigrationTypeLabel migrationType={migrationType} />}
      helpContent={t('The migration strategy used for this plan.')}
      crumbs={['spec', 'type']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanMigrationType, {
          isVddkInitImageNotSet,
          resource: plan,
          sourceProvider,
        });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default MigrationTypeDetailsItem;
