import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
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
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  const preserveClusterCpuModel = getPlanPreserveClusterCpuModel(plan);

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={
        <Label color="grey" isCompact>
          {preserveClusterCpuModel ? t('Preserve CPU model') : t('Use system default')}
        </Label>
      }
      crumbs={['spec', 'preserveClusterCpuModel']}
      helpContent={t(`Preserve the CPU model and flags the VM runs with in its oVirt cluster.`)}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditPlanPreserveClusterCpuModel, { resource: plan });
      }}
      title={t('Preserve CPU model')}
    />
  );
};

export default PreserveClusterCpuModelDetailsItem;
