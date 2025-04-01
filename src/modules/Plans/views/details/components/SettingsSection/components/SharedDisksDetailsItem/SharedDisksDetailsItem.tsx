import React, { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';

import MigrateSharedDisksModal from './components/MigrateSharedDisksModal/MigrateSharedDisksModal';
import { getMigrateSharedDisks } from './utils/helpers';
import { PlanDetailsItemProps } from '../../../DetailsSection/components/PlanDetailsItemProps';

const SharedDisksDetailsItem: FC<PlanDetailsItemProps> = ({ resource, canPatch }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const trueLabel = (
    <Label isCompact color={'green'}>
      {t('Migrate shared disks')}
    </Label>
  );
  const falseLabel = (
    <Label isCompact color={'blue'}>
      {t('Do not migrate shared disks')}
    </Label>
  );

  const content = getMigrateSharedDisks(resource) ? trueLabel : falseLabel;

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
