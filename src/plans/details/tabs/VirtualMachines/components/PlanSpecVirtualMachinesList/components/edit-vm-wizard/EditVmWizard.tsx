import { FormProvider } from 'react-hook-form';

import type { ProviderType, V1beta1Plan } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Divider, Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { useEditVmWizardForm } from './hooks/useEditVmWizardForm';
import { EditVmWizardContextProvider } from './EditVmWizardContext';
import EditVmWizardInner from './EditVmWizardInner';

import './edit-vm-wizard.scss';

export type EditVmWizardProps = {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  vmIndex: number;
};

const EditVmWizard: OverlayComponent<EditVmWizardProps> = ({
  closeOverlay,
  plan,
  providerType,
  vmIndex,
}) => {
  const { t } = useForkliftTranslation();
  const form = useEditVmWizardForm(plan, vmIndex);
  const vm = getPlanVirtualMachines(plan)[vmIndex];

  return (
    <Modal
      aria-label={t('Edit VM')}
      className="edit-vm-wizard-modal"
      data-testid="edit-vm-wizard-modal"
      isOpen
      onClose={closeOverlay}
      variant={ModalVariant.large}
    >
      <ModalHeader
        description={t('Edit {{vmName}} for migration', {
          vmName: vm?.name ?? t('selected'),
        })}
        title={t('Edit VM')}
      />
      <Divider className="edit-vm-wizard-modal__header-divider" component="div" />
      <ModalBody className="edit-vm-wizard-modal__body">
        <FormProvider {...form}>
          <EditVmWizardContextProvider plan={plan} providerType={providerType} vmIndex={vmIndex}>
            <EditVmWizardInner closeOverlay={closeOverlay} />
          </EditVmWizardContextProvider>
        </FormProvider>
      </ModalBody>
    </Modal>
  );
};

export default EditVmWizard;
