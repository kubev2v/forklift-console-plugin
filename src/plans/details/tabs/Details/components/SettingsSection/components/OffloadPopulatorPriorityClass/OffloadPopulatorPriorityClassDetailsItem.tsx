import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditOffloadPopulatorPriorityClass from './EditOffloadPopulatorPriorityClass';

const OffloadPopulatorPriorityClassDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const value = plan.spec?.offloadPopulatorPriorityClassName;

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={isEmpty(value) ? t('Cluster default') : value}
      crumbs={['spec', 'offloadPopulatorPriorityClassName']}
      helpContent={t(
        'Priority determines the order in which pods are scheduled and, when the cluster is under resource pressure, which pods are preempted. The selected PriorityClass applies to vSphere XCOPY populator pods.',
      )}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditOffloadPopulatorPriorityClass, { resource: plan });
      }}
      testId="offload-populator-priority-class-detail-item"
      title={t('Offload populator pod priority class')}
    />
  );
};

export default OffloadPopulatorPriorityClassDetailsItem;
