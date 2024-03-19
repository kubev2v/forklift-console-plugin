import React, { ReactNode, useCallback, useState } from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';

export interface PlanVMsDeleteModalProps {
  plan: V1beta1Plan;
  selected: string[];
}

export const PlanVMsDeleteModal: React.FC<PlanVMsDeleteModalProps> = ({ plan, selected }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [isLoading, toggleIsLoading] = useToggle();

  const vms = (plan?.spec?.vms || []).filter((vm) => !selected.includes(vm.id)) || [];

  React.useEffect(() => {
    if (vms.length < 1) {
      setAlertMessage(
        <AlertMessageForModals
          title={t('Error')}
          message={t(
            'All virtual machines planed for migration are selected for deletion, deleting all virtual machines from a migration plan is not allowed.',
          )}
        />,
      );
    }
  }, [vms]);

  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      const op = plan?.spec?.vms ? 'replace' : 'add';

      await k8sPatch({
        model: PlanModel,
        resource: plan,
        path: '',
        data: [{ op, path: '/spec/vms', value: vms }],
      });

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(
        <AlertMessageForModals title={t('Error')} message={err.message || err.toString()} />,
      );
    }
  }, [selected]);

  const actions = [
    <Button
      key="confirm"
      onClick={handleSave}
      variant="danger"
      isDisabled={vms.length < 1}
      isLoading={isLoading}
    >
      {t('Delete')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={t('Delete virtual machines from migration plan')}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <div className="forklift-edit-modal-body">
        {t('Are you sure you want to delete this virtual machines from the migration plan.')}
      </div>

      {alertMessage}
    </Modal>
  );
};
