import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { getPlanPreserveClusterCpuModel } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditPlanPreserveClusterCpuModel from './EditPlanPreserveClusterCpuModel';

const PreserveClusterCpuModelDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

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
        showModal(<EditPlanPreserveClusterCpuModel resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default PreserveClusterCpuModelDetailsItem;
