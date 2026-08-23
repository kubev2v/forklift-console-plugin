import type { FC } from 'react';
import EditNetworkNameTemplate, {
  type EditNetworkNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/EditNetworkNameTemplate';
import EditVmMigrateSharedDisks, {
  type EditVmMigrateSharedDisksProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/PlanMigrateSharedDisks/EditVmMigrateSharedDisks';
import EditPVCNameTemplate, {
  type EditPVCNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/EditPVCNameTemplate';
import EditVolumeNameTemplate, {
  type EditVolumeNameTemplateProps,
} from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/EditVolumeNameTemplate';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
} from './utils/utils';

type VsphereVmActionsDropdownItemsProps = {
  canEdit: boolean;
  plan: V1beta1Plan;
  vmIndex: number;
};

const VsphereVmActionsDropdownItems: FC<VsphereVmActionsDropdownItemsProps> = ({
  canEdit,
  plan,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const vm = getPlanVirtualMachines(plan)?.[vmIndex];

  return (
    <>
      <DropdownItem
        isDisabled={!canEdit}
        key="edit-pvc-name-template"
        onClick={() => {
          launchOverlay<EditPVCNameTemplateProps>(EditPVCNameTemplate, {
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
          launchOverlay<EditVolumeNameTemplateProps>(EditVolumeNameTemplate, {
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
          launchOverlay<EditNetworkNameTemplateProps>(EditNetworkNameTemplate, {
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
          launchOverlay<EditVmMigrateSharedDisksProps>(EditVmMigrateSharedDisks, {
            index: vmIndex,
            resource: plan,
          });
        }}
      >
        {t('Edit shared disks')}
      </DropdownItem>
    </>
  );
};

export default VsphereVmActionsDropdownItems;
