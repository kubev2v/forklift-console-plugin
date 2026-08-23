import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateProjectFormFields from './components/CreateProjectFormFields';
import { useCreateProjectForm } from './hooks/useCreateProjectForm';

import './CreateProjectModal.scss';

export type CreateProjectModalProps = {
  onCreated: (project: K8sResourceCommon) => void;
};

const CreateProjectModal: OverlayComponent<CreateProjectModalProps> = ({
  closeOverlay,
  onCreated,
}) => {
  const { t } = useForkliftTranslation();

  const {
    description,
    displayName,
    errorMessage,
    inProgress,
    name,
    setDescription,
    setDisplayName,
    setName,
    submit,
  } = useCreateProjectForm({ closeOverlay, onCreated });

  return (
    <Modal isOpen onClose={closeOverlay} variant={ModalVariant.small}>
      <ModalHeader title={t('Create project')} />
      <ModalBody>
        <CreateProjectFormFields
          description={description}
          displayName={displayName}
          errorMessage={errorMessage}
          name={name}
          onSubmit={submit}
          setDescription={setDescription}
          setDisplayName={setDisplayName}
          setName={setName}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="create-project-modal-create-button"
          id="confirm-action"
          isLoading={inProgress}
          onClick={submit}
          type="submit"
          variant={ButtonVariant.primary}
        >
          {t('Create project')}
        </Button>
        <Button
          data-testid="create-project-modal-cancel-button"
          isDisabled={inProgress}
          onClick={closeOverlay}
          type="button"
          variant={ButtonVariant.secondary}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateProjectModal;
