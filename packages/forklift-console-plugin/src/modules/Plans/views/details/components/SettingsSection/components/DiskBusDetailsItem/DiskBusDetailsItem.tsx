import React, { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanDetailsItemProps } from '../../../DetailsSection';
import { DiskBusType } from '../../utils/types';

import DiskBusModal from './components/DiskBusModal';
import { diskBusTypeLabels } from './utils/constants';
import { getDiskBus } from './utils/utils';

const DiskBusDetailsItem: FC<PlanDetailsItemProps> = ({ resource, canPatch }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const content = diskBusTypeLabels[getDiskBus(resource)] ?? diskBusTypeLabels[DiskBusType.VIRTIO];

  const title = t('Disk bus');
  const pathArray = ['spec', 'diskBus'];

  return (
    <DetailsItem
      title={title}
      content={content}
      crumbs={pathArray}
      onEdit={() => {
        if (canPatch && isPlanEditable(resource)) {
          showModal(<DiskBusModal resource={resource} jsonPath={pathArray} title={title} />);
        }
      }}
    />
  );
};

export default DiskBusDetailsItem;
