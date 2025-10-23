import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { getRootDisk } from '@utils/crds/plans/selectors';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';

import DiskLabel from './components/DiskLabel';
import EditRootDisk from './EditRootDisk';

const RootDiskDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan, shouldRender }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

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
        launcher<EditPlanProps>(EditRootDisk, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default RootDiskDetailsItem;
