import React, { ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, ItemIsOwnedAlert, useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { k8sDelete, K8sGroupVersionKind, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Modal, ModalVariant } from '@patternfly/react-core';

import { getPlanPhase, PlanPhase } from '../utils';

/**
 * Props for the DeleteModal component
 * @typedef DeleteModalProps
 * @property {string} title - The title to display in the modal
 * @property {V1beta1Plan} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
interface PlanDeleteModalProps {
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
export const PlanDeleteModal: React.FC<PlanDeleteModalProps> = ({
  title,
  resource,
  model,
  redirectTo,
}) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const title_ = title || t('Delete {{model.label}}', { model });
  const { name, namespace } = resource?.metadata || {};
  const owner = resource?.metadata?.ownerReferences?.[0];
  const groupVersionKind: K8sGroupVersionKind = {
    group: model.apiGroup,
    version: model.apiVersion,
    kind: model.kind,
  };

  const onDelete = useCallback(async () => {
    const isOnResourcePage = () => {
      const re = new RegExp(`/${name}(/|$)`);
      return re.test(window.location.pathname);
    };

    toggleIsLoading();

    try {
      await k8sDelete({ model, resource });
      if (redirectTo) {
        navigate(redirectTo);
      } else if (isOnResourcePage()) {
        navigate(getResourceUrl({ groupVersionKind, namespace }));
      }

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [resource]);

  const actions = [
    <Button key="confirm" variant="danger" onClick={onDelete} isLoading={isLoading}>
      {t('Delete')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  const phase = getPlanPhase({ obj: resource });

  const IsExecutingAlert: React.FC = () => (
    <Alert
      isInline
      variant="danger"
      title="Plan is currently running"
      className="forklift-delete-modal__alert"
    />
  );
  const IsNotArchivedAlert: React.FC = () => (
    <Alert
      isInline
      variant="info"
      title="Plan is not archived"
      className="forklift-delete-modal__alert"
    >
      <ForkliftTrans>
        Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
        <strong>archive</strong> the plan first before deleting it, to remove temporary resources.
      </ForkliftTrans>
    </Alert>
  );

  return (
    <Modal
      title={title_}
      titleIconVariant="warning"
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      {namespace ? (
        <ForkliftTrans>
          Are you sure you want to delete <strong className="co-break-word">{name}</strong> in
          namespace <strong>{namespace}</strong>?
        </ForkliftTrans>
      ) : (
        <ForkliftTrans>
          Are you sure you want to delete <strong className="co-break-word">{name}</strong>?
        </ForkliftTrans>
      )}
      {phase === PlanPhase.Running && <IsExecutingAlert />}
      {phase !== PlanPhase.Archived && <IsNotArchivedAlert />}
      {typeof owner === 'object' && <ItemIsOwnedAlert owner={owner} namespace={namespace} />}
      {alertMessage}
    </Modal>
  );
};
