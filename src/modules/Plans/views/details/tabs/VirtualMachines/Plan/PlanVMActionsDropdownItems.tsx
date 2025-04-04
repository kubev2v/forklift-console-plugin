import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DropdownItem, DropdownList } from '@patternfly/react-core';

import NetworkNameTemplateModal from '../../../components/SettingsSection/components/NetworkNameTemplate/NetworkNameTemplateModal';
import PVCNameTemplateModal from '../../../components/SettingsSection/components/PVCNameTemplate/PVCNameTemplateModal';
import VolumeNameTemplateModal from '../../../components/SettingsSection/components/VolumeNameTemplate/VolumeNameTemplateModal';
import type { VMData } from '../types/VMData';

type PlanVMActionsDropdownItemsProps = {
  data: VMData;
};

export const PlanVMActionsDropdownItems: FC<PlanVMActionsDropdownItemsProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const plan = data?.planData?.plan;

  const canEdit = data?.planData?.permissions?.canPatch && isPlanEditable(plan);

  return (
    <DropdownList>
      <DropdownItem
        value={1}
        key="edit-pvc-name-template"
        isDisabled={!canEdit}
        onClick={() => {
          showModal(
            <PVCNameTemplateModal
              resource={plan}
              jsonPath={`spec.vms.${data?.vmIndex}.pvcNameTemplate`}
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
            <VolumeNameTemplateModal
              resource={plan}
              jsonPath={`spec.vms.${data?.vmIndex}.volumeNameTemplate`}
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
            <NetworkNameTemplateModal
              resource={plan}
              jsonPath={`spec.vms.${data?.vmIndex}.networkNameTemplate`}
            />,
          );
        }}
      >
        {t('Edit Network name template')}
      </DropdownItem>
    </DropdownList>
  );
};
