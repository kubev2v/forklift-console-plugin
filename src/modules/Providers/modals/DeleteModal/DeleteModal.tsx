import { type FC, type ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  k8sDelete,
  type K8sGroupVersionKind,
  type K8sModel,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

import useToggle from '../../hooks/useToggle';
import { getResourceUrl } from '../../utils/helpers/getResourceUrl';
import { AlertMessageForModals } from '../components/AlertMessageForModals';
import { ItemIsOwnedAlert } from '../components/ItemIsOwnedAlert';
import { useModal } from '../ModalHOC/ModalHOC';

/**
 * Props for the DeleteModal component
 * @typedef DeleteModalProps
 * @property {string} title - The title to display in the modal
 * @property {K8sResourceCommon} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
type DeleteModalProps = {
  resource: K8sResourceCommon;
  model: K8sModel;
  title?: string;
  redirectTo?: string;
};

/**
 * A generic delete modal component
 * @component
 * @param {DeleteModalProps} props - Props for DeleteModal
 * @returns {Element} The DeleteModal component
 */
export const DeleteModal: FC<DeleteModalProps> = ({ model, redirectTo, resource, title }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const { name, namespace } = resource?.metadata ?? {};
  const owner = resource?.metadata?.ownerReferences?.[0];

  const onDelete = useCallback(async () => {
    const isOnResourcePage = () => {
      const re = new RegExp(`/${name}(/|$)`, 'u');
      return re.test(window.location.pathname);
    };

    toggleIsLoading();

    const groupVersionKind: K8sGroupVersionKind = {
      group: model.apiGroup,
      kind: model.kind,
      version: model.apiVersion,
    };

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

      if (err instanceof Error) {
        setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
      } else {
        setAlertMessage(<AlertMessageForModals title={t('Error')} message={t('Unknown error')} />);
      }
    }
  }, [resource, model, name, namespace, navigate, redirectTo, t, toggleIsLoading, toggleModal]);

  const actions = [
    <Button key="confirm" variant={ButtonVariant.danger} onClick={onDelete} isLoading={isLoading}>
      {t('Delete')}
    </Button>,
    <Button key="cancel" variant={ButtonVariant.secondary} onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={title ?? t('Delete {{model.label}}', { model })}
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
          project <strong>{namespace}</strong>?
        </ForkliftTrans>
      ) : (
        <ForkliftTrans>
          Are you sure you want to delete <strong className="co-break-word">{name}</strong>?
        </ForkliftTrans>
      )}
      {typeof owner === 'object' && <ItemIsOwnedAlert owner={owner} namespace={namespace} />}
      {alertMessage}
    </Modal>
  );
};
