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

  const title = t('Shared disks');
  const pathArray = ['spec', 'migrateSharedDisks'];

  return (
    <DetailsItem
      title={title}
      content={content}
      crumbs={pathArray}
      onEdit={() => {
        showModal(
          <MigrateSharedDisksModal resource={resource} jsonPath={pathArray} title={title} />,
        );
      }}
      canEdit={canPatch && isPlanEditable(resource)}
    />
  );
};

export default SharedDisksDetailsItem;
