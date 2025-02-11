import React, { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanDetailsItemProps } from '../../../DetailsSection';

import MigrateSharedDisksModal from './components/MigrateSharedDisksModal/MigrateSharedDisksModal';
import { getMigrateSharedDisks } from './utils/helpers';

const SharedDisksDetailsItem: FC<PlanDetailsItemProps> = ({ resource, canPatch }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const content = getMigrateSharedDisks(resource)
    ? t('Migrate shared disks again')
    : t('Migrate shared disks only once');

  return (
    <DetailsItem
      title={t('Shared disks')}
      content={content}
      crumbs={['spec', 'migrateSharedDisks']}
      onEdit={() => {
        if (canPatch && isPlanEditable(resource)) {
          showModal(<MigrateSharedDisksModal resource={resource} />);
        }
      }}
    />
  );
};

export default SharedDisksDetailsItem;
