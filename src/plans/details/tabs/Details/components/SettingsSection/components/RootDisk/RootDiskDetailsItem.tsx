import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getRootDisk } from '@utils/crds/plans/selectors';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';

import DiskLabel from './components/DiskLabel';
import EditRootDisk from './EditRootDisk';

const RootDiskDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  const rootDisk = getRootDisk(plan);

  return (
    <DetailsItem
      title={t('Root device')}
      content={<DiskLabel diskKey={rootDisk} />}
      helpContent={t(`Choose the root filesystem to be converted.`)}
      moreInfoLink={VIRT_V2V_HELP_LINK}
      crumbs={['spec', 'vms', 'rootDisk']}
      onEdit={() => {
        showModal(<EditRootDisk resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default RootDiskDetailsItem;
