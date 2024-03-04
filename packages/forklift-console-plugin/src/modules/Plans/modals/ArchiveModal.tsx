import React, { ReactNode, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Modal, ModalVariant } from '@patternfly/react-core';

import { getPlanPhase } from '../utils';

/**
 * Props for the DeleteModal component
 * @typedef ArchiveModalProps
 * @property {string} title - The title to display in the modal
 * @property {V1beta1Plan} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
interface ArchiveModalProps {
  resource: V1beta1Plan;
  model: K8sModel;
  title?: string;
  redirectTo?: string;
}

/**
 * A generic delete modal component
 * @component
 * @param {ArchiveModalProps} props - Props for DeleteModal
 * @returns {React.Element} The DeleteModal component
 */
export const ArchiveModal: React.FC<ArchiveModalProps> = ({ title, resource, redirectTo }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const history = useHistory();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const title_ = title || t('Archive migration plan');
  const { name } = resource?.metadata || {};

  const onArchive = useCallback(async () => {
    toggleIsLoading();
    try {
      const op = resource?.spec?.archived ? 'replace' : 'add';

      await k8sPatch({
        model: PlanModel,
        resource,
        path: '',
        data: [{ op, path: '/spec/archived', value: true }],
      });

      if (redirectTo) {
        history.push(redirectTo);
      }

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [resource]);

  const phase = getPlanPhase({ obj: resource });

  const actions = [
    <Button
      key="confirm"
      variant={phase === 'Running' ? 'danger' : 'primary'}
      onClick={onArchive}
      isLoading={isLoading}
    >
      {t('Archive')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  const IsExecutingAlert: React.FC = () => (
    <Alert
      isInline
      variant="danger"
      title="Plan is currently running"
      className="forklift-delete-modal__alert"
    />
  );

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
            Archive plan <strong className="co-break-word">{{ resourceName: name }}</strong>?
          </p>
          <br />
          <p>
            When a plan is archived, its history, metadata, and logs are deleted. The plan cannot be
            edited or restarted but it can be viewed.
          </p>
        </ForkliftTrans>
      }
      {phase === 'Running' && <IsExecutingAlert />}
      {alertMessage}
    </Modal>
  );
};
