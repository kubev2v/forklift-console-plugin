import { type FC, useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';

import { Button, ButtonVariant, useWizardContext } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { PlanWizardStepId } from '../../constants';
import CreatePlanWizardFooter from '../../CreatePlanWizardFooter';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { useStepValidation } from '../../hooks/useStepValidation';
import type { ProviderVirtualMachine } from '../../types';
import { GeneralFormFieldId } from '../general-information/constants';

import { VmFormFieldId } from './constants';
import { getVmsWithCriticalConcerns, hasCriticalConcern } from './utils';
import VirtualMachinesTable from './VirtualMachinesTable';

const VirtualMachinesStepFooter: FC = () => {
  const { t } = useForkliftTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingVmIds, setPendingVmIds] = useState<string[]>();
  const { goToNextStep } = useWizardContext();
  const { control, setValue, trigger } = useCreatePlanFormContext();
  const { validateStep } = useStepValidation();
  const [sourceProvider, selectedVms] = useWatch({
    control,
    name: [GeneralFormFieldId.SourceProvider, VmFormFieldId.Vms],
  });
  const [vmInventoryData] = useInventoryVms({ provider: sourceProvider });
  const vmsWithCriticalIssues = getVmsWithCriticalConcerns(selectedVms);

  const pendingVms = useMemo(
    () =>
      pendingVmIds
        ? Object.fromEntries(pendingVmIds.map((id) => [id, selectedVms[id]]))
        : vmsWithCriticalIssues,
    [pendingVmIds, selectedVms, vmsWithCriticalIssues],
  );

  // Get VM data for the critical concern VMs to display in modal
  const criticalVmData = useMemo(
    () => vmInventoryData.filter(({ vm }) => hasCriticalConcern(vm) && vm.id in selectedVms),
    [vmInventoryData, selectedVms],
  );

  // Validate form and handle next step or show warning modal
  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(PlanWizardStepId.VirtualMachines);

    if (isValid) {
      // Skip modal if no critical issues found
      if (isEmpty(Object.keys(vmsWithCriticalIssues))) {
        await goToNextStep();
        return;
      }

      // Show warning modal for VMs with critical issues
      setIsModalOpen(true);
    }
  }, [validateStep, vmsWithCriticalIssues, goToNextStep]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setPendingVmIds(undefined);
  }, []);

  // Handle VM selection updates and navigation
  const updateVmSelectionAndProceed = useCallback(
    async (vms: Record<string, ProviderVirtualMachine>) => {
      setValue(VmFormFieldId.Vms, vms);
      closeModal();

      if (isEmpty(vms)) {
        await trigger(VmFormFieldId.Vms);
        return;
      }

      await goToNextStep();
    },
    [closeModal, goToNextStep, setValue, trigger],
  );

  // Confirm selection including pending VMs from modal
  const confirmSelection = useCallback(async () => {
    const nonCriticalVms = Object.fromEntries(
      Object.entries(selectedVms).filter(([_, vm]) => !hasCriticalConcern(vm)),
    );

    // Combine non-critical VMs with user's staged selections
    const updatedVmSelections = {
      ...nonCriticalVms,
      ...pendingVms,
    };

    await updateVmSelectionAndProceed(updatedVmSelections);
  }, [selectedVms, pendingVms, updateVmSelectionAndProceed]);

  // Remove all VMs with critical issues and proceed
  const deselectCriticalVms = useCallback(async () => {
    const updatedVmSelections = { ...selectedVms };
    const criticalVmIds = Object.keys(vmsWithCriticalIssues);

    for (const vmId of criticalVmIds) {
      delete updatedVmSelections[vmId];
    }

    await updateVmSelectionAndProceed(updatedVmSelections);
  }, [selectedVms, vmsWithCriticalIssues, updateVmSelectionAndProceed]);

  // Handle VM selection changes in the modal
  const handleVmSelectionChange = useCallback((vms: Record<string, ProviderVirtualMachine>) => {
    setPendingVmIds(Object.keys(vms));
  }, []);

  return (
    <>
      <CreatePlanWizardFooter onNext={handleNextStep} />

      {isModalOpen && (
        <Modal
          isOpen
          variant={ModalVariant.large}
          title={t('Confirm selections with critical issues')}
          titleIconVariant="danger"
          description={t(
            'Critical issues detected in your selected VMs will cause the migration to fail. Resolve these issues or remove the VMs from the plan before starting the migration.',
          )}
          onClose={closeModal}
          actions={[
            <Button key="confirm" onClick={confirmSelection}>
              {t('Confirm selections')}
            </Button>,
            <Button key="deselect" variant={ButtonVariant.secondary} onClick={deselectCriticalVms}>
              {t('Deselect critical issue VMs')}
            </Button>,
            <Button key="cancel" variant={ButtonVariant.secondary} onClick={closeModal}>
              {t('Cancel')}
            </Button>,
          ]}
        >
          <VirtualMachinesTable
            vmData={criticalVmData}
            initialSelectedIds={Object.keys(vmsWithCriticalIssues)}
            value={pendingVms}
            isSelectable
            onChange={handleVmSelectionChange}
            hasCriticalConcernFilter
          />
        </Modal>
      )}
    </>
  );
};

export default VirtualMachinesStepFooter;
