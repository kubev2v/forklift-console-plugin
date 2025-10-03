import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getTargetPowerStateLabel } from 'src/plans/constants';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label } from '@patternfly/react-core';
import { getPlanTargetPowerState } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';

import EditTargetPowerState from './EditTargetPowerState';

const TargetPowerStateDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  return (
    <DetailsItem
      testId="target-vm-power-state-detail-item"
      title={t('VM target power state')}
      content={
        <Label isCompact color="grey">
          {getTargetPowerStateLabel(getPlanTargetPowerState(plan))}
        </Label>
      }
      helpContent={t(
        `Choose what state you'd like all of the VMs in your plan to be powered to after migration. You can change this setting for specific VMs in the Virtual machines tab.`,
      )}
      crumbs={['spec', 'targetPowerState']}
      onEdit={() => {
        showModal(<EditTargetPowerState resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};

export default TargetPowerStateDetailsItem;
