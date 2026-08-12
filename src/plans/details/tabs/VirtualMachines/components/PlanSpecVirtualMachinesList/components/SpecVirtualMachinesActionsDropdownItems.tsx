import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import EditNetworkNameTemplate, {
  type EditNetworkNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/EditNetworkNameTemplate';
import EditVmMigrateSharedDisks, {
  type EditVmMigrateSharedDisksProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/PlanMigrateSharedDisks/EditVmMigrateSharedDisks';
import EditPVCNameTemplate, {
  type EditPVCNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/EditPVCNameTemplate';
import EditVmTargetPowerState, {
  type EditVmTargetPowerStateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/TargetPowerState/EditVmTargetPowerState';
import EditVolumeNameTemplate, {
  type EditVolumeNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/EditVolumeNameTemplate';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type ProviderType, type V1beta1Plan } from '@forklift-ui/types';
import { useModal, useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import EditVmInstanceType, {
  type EditVmInstanceTypeProps,
} from './InstanceType/EditVmInstanceType';
import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
} from './utils/utils';
import EditVirtualMachineTargetName, {
  type EditVirtualMachineTargetNameProps,
} from './VirtualMachineTargetName/EditVirtualMachineTargetName';

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
  const launcher = useModal();
  const launchOverlay = useOverlay();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });
  const canEdit = canPatch && isPlanEditable(plan);

  const isVsphere = providerType === PROVIDER_TYPES.vsphere;

  const vm = getPlanVirtualMachines(plan)?.[vmIndex];

  return (
    <DropdownList>
      <DropdownItem
        data-testid="edit-vm-target-name-menu-item"
        isDisabled={!canEdit}
        key="edit-vm-target-name"
        onClick={() => {
          launcher<EditVirtualMachineTargetNameProps>(EditVirtualMachineTargetName, {
            plan,
            vmIndex,
          });
        }}
      >
        {t('Edit target name')}
      </DropdownItem>
      {isVsphere && (
        <>
          <DropdownItem
            isDisabled={!canEdit}
            key="edit-pvc-name-template"
            onClick={() => {
              launcher<EditPVCNameTemplateProps>(EditPVCNameTemplate, {
                onConfirmPVCNameTemplate: onConfirmVirtualMachinePVCNameTemplate(vmIndex),
                resource: plan,
                value: vm?.pvcNameTemplate,
              });
            }}
          >
            {t('Edit PVC name template')}
          </DropdownItem>
          <DropdownItem
            isDisabled={!canEdit}
            key="edit-volume-name-template"
            onClick={() => {
              launcher<EditVolumeNameTemplateProps>(EditVolumeNameTemplate, {
                onConfirmVolumeNameTemplate: onConfirmVirtualMachineVolumeNameTemplate(vmIndex),
                resource: plan,
                value: vm?.volumeNameTemplate,
              });
            }}
          >
            {t('Edit volume name template')}
          </DropdownItem>
          <DropdownItem
            isDisabled={!canEdit}
            key="edit-network-name-template"
            onClick={() => {
              launcher<EditNetworkNameTemplateProps>(EditNetworkNameTemplate, {
                onConfirmNetworkNameTemplate: onConfirmVirtualMachineNetworkNameTemplate(vmIndex),
                resource: plan,
                value: vm?.networkNameTemplate,
              });
            }}
          >
            {t('Edit network name template')}
          </DropdownItem>
          <DropdownItem
            data-testid="edit-vm-shared-disks-menu-item"
            isDisabled={!canEdit}
            key="edit-vm-shared-disks"
            onClick={() => {
              launcher<EditVmMigrateSharedDisksProps>(EditVmMigrateSharedDisks, {
                index: vmIndex,
                resource: plan,
              });
            }}
          >
            {t('Edit shared disks')}
          </DropdownItem>
        </>
      )}
      <DropdownItem
        data-testid="edit-vm-target-power-state-menu-item"
        isDisabled={!canEdit}
        key="edit-target-power-state"
        onClick={() => {
          launcher<EditVmTargetPowerStateProps>(EditVmTargetPowerState, {
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
