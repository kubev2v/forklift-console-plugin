import { type FC, type ReactNode, useCallback, useState } from 'react';
import useToggle from 'src/modules/Providers/hooks/useToggle';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';

type PlanVMsDeleteModalProps = {
  plan: V1beta1Plan;
  selected: string[];
};

export const PlanVMsDeleteModal: FC<PlanVMsDeleteModalProps> = ({ plan, selected }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [isLoading, toggleIsLoading] = useToggle();

  const vms = (plan?.spec?.vms || []).filter((vm) => !selected.includes(vm.id)) || [];

  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      const op = plan?.spec?.vms ? 'replace' : 'add';

      await k8sPatch({
        data: [{ op, path: '/spec/vms', value: vms }],
        model: PlanModel,
        path: '',
        resource: plan,
      });

      toggleModal();
    } catch (err) {
      toggleIsLoading();
      setAlertMessage(err.message || err.toString());
    }
  }, [selected]);

  const actions = [
    <Button key="confirm" onClick={handleSave} variant={ButtonVariant.danger} isLoading={isLoading}>
      {t('Delete')}
    </Button>,
    <Button key="cancel" variant={ButtonVariant.secondary} onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={t('Delete virtual machines from migration plan?')}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <div className="forklift-edit-modal-body">
        {t('The virtual machines will be permanently deleted from your migration plan.')}
      </div>
      {alertMessage && <AlertMessageForModals title={t('Error')} message={alertMessage} />}
    </Modal>
  );
};
