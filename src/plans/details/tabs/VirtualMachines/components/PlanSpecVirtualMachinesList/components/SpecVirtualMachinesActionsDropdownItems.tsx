import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import EditVmTargetPowerState, {
  type EditVmTargetPowerStateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/TargetPowerState/EditVmTargetPowerState';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type ProviderType, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import EditVmInstanceType, {
  type EditVmInstanceTypeProps,
} from './InstanceType/EditVmInstanceType';
import EditVirtualMachineTargetName, {
  type EditVirtualMachineTargetNameProps,
} from './VirtualMachineTargetName/EditVirtualMachineTargetName';
import VsphereVmActionsDropdownItems from './VsphereVmActionsDropdownItems';

type SpecVirtualMachinesActionsDropdownItemsProps = {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  vmIndex: number;
};

const SpecVirtualMachinesActionsDropdownItems: FC<SpecVirtualMachinesActionsDropdownItemsProps> = ({
  plan,
  providerType,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });
  const canEdit = canPatch && isPlanEditable(plan);
  const isVsphere = providerType === PROVIDER_TYPES.vsphere;

  return (
    <DropdownList>
      <DropdownItem
        data-testid="edit-vm-target-name-menu-item"
        isDisabled={!canEdit}
        key="edit-vm-target-name"
        onClick={() => {
          launchOverlay<EditVirtualMachineTargetNameProps>(EditVirtualMachineTargetName, {
            plan,
            vmIndex,
          });
        }}
      >
        {t('Edit target name')}
      </DropdownItem>
      {isVsphere && (
        <VsphereVmActionsDropdownItems canEdit={canEdit} plan={plan} vmIndex={vmIndex} />
      )}
      <DropdownItem
        data-testid="edit-vm-target-power-state-menu-item"
        isDisabled={!canEdit}
        key="edit-target-power-state"
        onClick={() => {
          launchOverlay<EditVmTargetPowerStateProps>(EditVmTargetPowerState, {
            index: vmIndex,
            resource: plan,
          });
        }}
        value={4}
      >
        {t('Edit target power state')}
      </DropdownItem>
      <DropdownItem
        data-testid="edit-vm-instance-type-menu-item"
        isDisabled={!canEdit}
        key="edit-instance-type"
        onClick={() => {
          launchOverlay<EditVmInstanceTypeProps>(EditVmInstanceType, {
            index: vmIndex,
            resource: plan,
          });
        }}
      >
        {t('Edit instance type')}
      </DropdownItem>
    </DropdownList>
  );
};

export default SpecVirtualMachinesActionsDropdownItems;
