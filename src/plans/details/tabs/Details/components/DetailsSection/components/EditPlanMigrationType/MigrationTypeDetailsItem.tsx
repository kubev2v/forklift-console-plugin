import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';

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
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const migrationType = getPlanMigrationType(plan);

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={<PlanMigrationTypeLabel migrationType={migrationType} />}
      crumbs={['spec', 'type']}
      helpContent={t('The migration strategy used for this plan.')}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditPlanMigrationType, {
          isVddkInitImageNotSet,
          resource: plan,
          sourceProvider,
        });
      }}
      testId="migration-type-detail-item"
      title={t('Migration type')}
    />
  );
};

export default MigrationTypeDetailsItem;
