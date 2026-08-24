import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { getTargetPowerStateLabel } from 'src/plans/constants';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getPlanTargetPowerState } from '@utils/crds/plans/selectors';

import type { EditableDetailsItemProps } from '../../../utils/types';
import type { EditPlanProps } from '../../utils/types';

import EditTargetPowerState from './EditTargetPowerState';

const TargetPowerStateDetailsItem: FC<EditableDetailsItemProps> = ({ canPatch, plan }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={
        <Label color="grey" isCompact>
          {getTargetPowerStateLabel(getPlanTargetPowerState(plan))}
        </Label>
      }
      crumbs={['spec', 'targetPowerState']}
      helpContent={t(
        `Choose what state you'd like all of the VMs in your plan to be powered to after migration. You can change this setting for specific VMs in the Virtual machines tab.`,
      )}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditTargetPowerState, { resource: plan });
      }}
      testId="target-vm-power-state-detail-item"
      title={t('VM target power state')}
    />
  );
};

export default TargetPowerStateDetailsItem;
