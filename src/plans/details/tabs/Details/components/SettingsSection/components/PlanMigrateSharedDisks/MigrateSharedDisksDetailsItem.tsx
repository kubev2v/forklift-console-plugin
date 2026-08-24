import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getMigrateSharedDisksValue } from './utils/utils';
import EditMigrateSharedDisks from './EditMigrateSharedDisks';

const SharedDisksDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  isVddkInitImageNotSet,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const migrateSharedDisks = getMigrateSharedDisksValue(plan);

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={
        <Label color="grey" isCompact>
          {migrateSharedDisks ? t('Migrate shared disks') : t('Do not migrate shared disks')}
        </Label>
      }
      crumbs={['spec', 'migrateSharedDisks']}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditMigrateSharedDisks, {
          isVddkInitImageNotSet,
          resource: plan,
        });
      }}
      testId="shared-disks-detail-item"
      title={t('Shared disks')}
    />
  );
};

export default SharedDisksDetailsItem;
