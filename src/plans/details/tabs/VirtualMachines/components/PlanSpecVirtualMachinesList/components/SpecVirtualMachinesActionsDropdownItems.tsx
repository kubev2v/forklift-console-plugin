import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import EditNetworkNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/EditNetworkNameTemplate';
import EditPVCNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/EditPVCNameTemplate';
import EditVmTargetPowerState from 'src/plans/details/tabs/Details/components/SettingsSection/components/TargetPowerState/EditVmTargetPowerState';
import EditVolumeNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/EditVolumeNameTemplate';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type ProviderType, type V1beta1Plan } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
} from './utils/utils';
import EditVirtualMachineTargetName from './VirtualMachineTargetName/EditVirtualMachineTargetName';

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
  const { showModal } = useModal();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });
  const canEdit = canPatch && isPlanEditable(plan);

  const isVsphere = providerType === PROVIDER_TYPES.vsphere;

  return (
    <DropdownList>
      <DropdownItem
        key="edit-vm-target-name"
        isDisabled={!canEdit}
        onClick={() => {
          showModal(<EditVirtualMachineTargetName plan={plan} vmIndex={vmIndex} />);
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
              showModal(
                <EditPVCNameTemplate
                  resource={plan}
                  onConfirmPVCNameTemplate={onConfirmVirtualMachinePVCNameTemplate(vmIndex)}
                />,
              );
            }}
          >
            {t('Edit PVC name template')}
          </DropdownItem>
          <DropdownItem
            key="edit-volume-name-template"
            isDisabled={!canEdit}
            onClick={() => {
              showModal(
                <EditVolumeNameTemplate
                  resource={plan}
                  onConfirmVolumeNameTemplate={onConfirmVirtualMachineVolumeNameTemplate(vmIndex)}
                />,
              );
            }}
          >
            {t('Edit volume name template')}
          </DropdownItem>
          <DropdownItem
            key="edit-network-name-template"
            isDisabled={!canEdit}
            onClick={() => {
              showModal(
                <EditNetworkNameTemplate
                  resource={plan}
                  onConfirmNetworkNameTemplate={onConfirmVirtualMachineNetworkNameTemplate(vmIndex)}
                />,
              );
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
          showModal(<EditVmTargetPowerState resource={plan} index={vmIndex} />);
        }}
        data-testid="edit-vm-target-power-state-menu-item"
      >
        {t('Edit target power state')}
      </DropdownItem>
    </DropdownList>
  );
};

export default SpecVirtualMachinesActionsDropdownItems;
