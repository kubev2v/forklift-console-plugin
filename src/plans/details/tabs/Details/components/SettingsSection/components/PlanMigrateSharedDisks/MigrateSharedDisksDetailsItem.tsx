import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getMigrateSharedDisksValue } from './utils/utils';
import EditMigrateSharedDisks from './EditMigrateSharedDisks';

const SharedDisksDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const migrateSharedDisks = getMigrateSharedDisksValue(plan);

  return (
    <DetailsItem
      title={t('Shared disks')}
      content={
        <Label isCompact color="grey">
          {migrateSharedDisks ? t('Migrate shared disks') : t('Do not migrate shared disks')}
        </Label>
      }
      crumbs={['spec', 'migrateSharedDisks']}
      onEdit={() => {
        launcher<EditPlanProps>(EditMigrateSharedDisks, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default SharedDisksDetailsItem;
