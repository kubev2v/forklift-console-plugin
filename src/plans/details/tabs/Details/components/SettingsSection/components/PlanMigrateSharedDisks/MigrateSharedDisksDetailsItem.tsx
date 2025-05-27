import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import type { EditableDetailsItemProps } from '../../../utils/types';

import { getMigrateSharedDisksValue } from './utils/utils';
import EditMigrateSharedDisks from './EditMigrateSharedDisks';

const SharedDisksDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

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
        showModal(<EditMigrateSharedDisks resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default SharedDisksDetailsItem;
