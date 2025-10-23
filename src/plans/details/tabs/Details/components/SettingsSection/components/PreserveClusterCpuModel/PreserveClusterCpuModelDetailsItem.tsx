import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getPlanPreserveClusterCpuModel } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';
import type { EditPlanProps } from '../../utils/types';

import EditPlanPreserveClusterCpuModel from './EditPlanPreserveClusterCpuModel';

const PreserveClusterCpuModelDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  if (!shouldRender) return null;

  const preserveClusterCpuModel = getPlanPreserveClusterCpuModel(plan);

  return (
    <DetailsItem
      title={t('Preserve CPU model')}
      content={
        <Label isCompact color="grey">
          {preserveClusterCpuModel ? t('Preserve CPU model') : t('Use system default')}
        </Label>
      }
      helpContent={t(`Preserve the CPU model and flags the VM runs with in its oVirt cluster.`)}
      crumbs={['spec', 'preserveClusterCpuModel']}
      onEdit={() => {
        launcher<EditPlanProps>(EditPlanPreserveClusterCpuModel, { resource: plan });
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PreserveClusterCpuModelDetailsItem;
