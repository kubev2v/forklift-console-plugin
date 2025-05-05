import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import EditNetworkNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/EditNetworkNameTemplate';
import EditPVCNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/EditPVCNameTemplate';
import EditVolumeNameTemplate from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/EditVolumeNameTemplate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
} from './utils/utils';

type SpecVirtualMachinesActionsDropdownItemsProps = {
  plan: V1beta1Plan;
  vmIndex: number;
};

const SpecVirtualMachinesActionsDropdownItems: FC<SpecVirtualMachinesActionsDropdownItemsProps> = ({
  plan,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });
  const canEdit = canPatch && isPlanEditable(plan);

  return (
    <DropdownList>
      <DropdownItem
        value={1}
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
        value={2}
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
        {t('Edit Volume name template')}
      </DropdownItem>
      <DropdownItem
        value={3}
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
        {t('Edit Network name template')}
      </DropdownItem>
    </DropdownList>
  );
};

export default SpecVirtualMachinesActionsDropdownItems;
