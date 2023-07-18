import React, { ReactNode, useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  k8sDelete,
  K8sGroupVersionKind,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

import { useToggle } from '../../hooks';
import { getResourceUrl } from '../../utils';
import { AlertMessageForModals, ItemIsOwnedAlert } from '../components';
import { useModal } from '../ModalHOC';

/**
 * Props for the DeleteModal component
 * @typedef DeleteModalProps
 * @property {string} title - The title to display in the modal
 * @property {K8sResourceCommon} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
interface DeleteModalProps {
  resource: K8sResourceCommon;
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
export const DeleteModal: React.FC<DeleteModalProps> = ({ title, resource, model, redirectTo }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const history = useHistory();
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
        history.push(redirectTo);
      } else if (isOnResourcePage()) {
        history.push(getResourceUrl({ groupVersionKind, namespace }));
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
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Are you sure you want to delete{' '}
          <strong className="co-break-word">{{ resourceName: name }}</strong> in namespace{' '}
          <strong>{{ namespace: namespace }}</strong>?
        </Trans>
      ) : (
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Are you sure you want to delete{' '}
          <strong className="co-break-word">{{ resourceName: name }}</strong>?
        </Trans>
      )}
      {typeof owner === 'object' && <ItemIsOwnedAlert owner={owner} namespace={namespace} />}
      {alertMessage}
    </Modal>
  );
};
