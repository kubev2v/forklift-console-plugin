import React, { ReactNode, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { MigrationModel, V1beta1Migration, V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

/**
 * Props for the DeleteModal component
 * @typedef PlanStartMigrationModalProps
 * @property {string} title - The title to display in the modal
 * @property {V1beta1Plan} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
interface PlanStartMigrationModalProps {
  resource: V1beta1Plan;
  model: K8sModel;
  title?: string;
  redirectTo?: string;
}

/**
 * A generic delete modal component
 * @component
 * @param {DeleteModalProps} props - Props for DeleteModal
 * @returns {React.Element} The DeleteModal component
 */
export const PlanStartMigrationModal: React.FC<PlanStartMigrationModalProps> = ({
  title,
  resource,
  redirectTo,
}) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const history = useHistory();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const title_ = title || t('Start migration');
  const { name, namespace, uid } = resource?.metadata || {};

  const onStart = useCallback(async () => {
    toggleIsLoading();

    try {
      const migration: V1beta1Migration = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Migration',
        metadata: {
          generateName: `${name}-`,
          namespace: namespace,
          ownerReferences: [
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'Plan',
              name: name,
              uid: uid,
            },
          ],
        },
        spec: {
          plan: {
            name: name,
            namespace: namespace,
            uid: uid,
          },
        },
      };

      await k8sCreate({ model: MigrationModel, data: migration });
      if (redirectTo) {
        history.push(redirectTo);
      }

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [resource]);

  const actions = [
    <Button key="confirm" onClick={onStart} isLoading={isLoading}>
      {t('Start')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={title_}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      {
        <ForkliftTrans>
          <p>
            Start the migration for plan{' '}
            <strong className="co-break-word">{{ resourceName: name }}</strong>?
          </p>
          <br />
          <p>VMs included in the migration plan will be shut down.</p>
        </ForkliftTrans>
      }
      {alertMessage}
    </Modal>
  );
};
