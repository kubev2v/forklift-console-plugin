import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import EditNetworkNameTemplate, {
  type EditNetworkNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/EditNetworkNameTemplate';
import EditPVCNameTemplate, {
  type EditPVCNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/EditPVCNameTemplate';
import EditVmTargetPowerState, {
  type EditVmTargetPowerStateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/TargetPowerState/EditVmTargetPowerState';
import EditVolumeNameTemplate, {
  type EditVolumeNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/EditVolumeNameTemplate';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type ProviderType, type V1beta1Plan } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

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
  vmIndex: number;
  providerType: ProviderType;
};

const SpecVirtualMachinesActionsDropdownItems: FC<SpecVirtualMachinesActionsDropdownItemsProps> = ({
  plan,
  providerType,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

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
        key="edit-vm-target-name"
        isDisabled={!canEdit}
        onClick={() => {
          launcher<EditVirtualMachineTargetNameProps>(EditVirtualMachineTargetName, {
            plan,
            vmIndex,
          });
        }}
        data-testid="edit-vm-target-name-menu-item"
      >
        {t('Edit target name')}
      </DropdownItem>
      {isVsphere && (
        <>
          <DropdownItem
            key="edit-pvc-name-template"
            isDisabled={!canEdit}
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
            key="edit-volume-name-template"
            isDisabled={!canEdit}
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
            key="edit-network-name-template"
            isDisabled={!canEdit}
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
        </>
      )}
      <DropdownItem
        value={4}
        key="edit-target-power-state"
        isDisabled={!canEdit}
        onClick={() => {
          launcher<EditVmTargetPowerStateProps>(EditVmTargetPowerState, {
            index: vmIndex,
            resource: plan,
          });
        }}
        data-testid="edit-vm-target-power-state-menu-item"
      >
        {t('Edit target power state')}
      </DropdownItem>
    </DropdownList>
  );
};

export default SpecVirtualMachinesActionsDropdownItems;
