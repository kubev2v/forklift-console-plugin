import React, { ReactNode, useCallback, useState } from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { MigrationModel, V1beta1Migration } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

import './PlanVMsDeleteModal.style.css';

export interface MigrationVMsCancelModalProps {
  migration: V1beta1Migration;
  selected: string[];
}

export const MigrationVMsCancelModal: React.FC<MigrationVMsCancelModalProps> = ({
  migration,
  selected,
}) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [isLoading, toggleIsLoading] = useToggle();

  const vms = migration?.spec?.cancel || [];
  selected.forEach((id) => vms.push({ id: id }));

  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      const op = migration?.spec?.cancel ? 'replace' : 'add';

      await k8sPatch({
        model: MigrationModel,
        resource: migration,
        path: '',
        data: [{ op, path: '/spec/cancel', value: vms }],
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
      variant="primary"
      isDisabled={vms.length < 1}
      isLoading={isLoading}
    >
      {t('Cancel migration')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={t('Cancel virtual machines from migration plan')}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <div className="forklift-edit-modal-body">
        {t('You can cancel virtual machines from a running migration plan.')}
      </div>

      {alertMessage}
    </Modal>
  );
};
