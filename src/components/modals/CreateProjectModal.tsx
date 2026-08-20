import { type FormEvent, type MouseEvent, useState } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import ProjectNameHelp from '@components/modals/ProjectNameHelp';
import { k8sCreate, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ProjectModel } from '@openshift-console/dynamic-plugin-sdk/lib/models';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { isUpstream } from '@utils/env';
import { useForkliftTranslation } from '@utils/i18n';

import './CreateProjectModal.scss';

const UPSTREAM_LATEST = 'https://docs.okd.io/latest/';

const workingWithProjectsURLs = {
  downstream: 'html/building_applications/projects#working-with-projects',
  upstream: 'applications/projects/working-with-projects.html',
};

const projectDescriptionAnnotation = 'openshift.io/description';
const projectDisplayNameAnnotation = 'openshift.io/display-name';

export type CreateProjectModalProps = {
  onCreated: (project: K8sResourceCommon) => void;
};

const CreateProjectModal: OverlayComponent<CreateProjectModalProps> = ({
  closeOverlay,
  onCreated,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useForkliftTranslation();

  const submit = (event: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setInProgress(true);

    const project = {
      metadata: {
        annotations: {
          [projectDescriptionAnnotation]: description,
          [projectDisplayNameAnnotation]: displayName,
        },
        name,
      },
    };

    k8sCreate({ data: project, model: ProjectModel })
      .then((obj) => {
        setErrorMessage('');
        onCreated(obj);
        closeOverlay();
      })
      .catch((error: Error) => {
        const err = error.message || t('An error occurred. Please try again.');
        setErrorMessage(err);
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const projectsURL = isUpstream()
    ? `${UPSTREAM_LATEST}${workingWithProjectsURLs.upstream}`
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `${window.SERVER_FLAGS?.documentationBaseURL ?? ''}${workingWithProjectsURLs.downstream}`;

  return (
    <Modal isOpen onClose={closeOverlay} variant={ModalVariant.small}>
      <ModalHeader title={t('Create project')} />
      <ModalBody>
        <Form name="form" onSubmit={submit}>
          <Content>
            <Content component={ContentVariants.p}>
              {t(
                'A project, also known as a namespace, separates resources within clusters. It is an alternative representation of a Kubernetes namespace.',
              )}{' '}
              <ExternalLink hideIcon href={projectsURL} isInline>
                {t('Learn more about projects.')}
              </ExternalLink>
            </Content>
          </Content>
          <FormGroup
            fieldId="input-name"
            isRequired
            label={t('Name')}
            labelHelp={<ProjectNameHelp />}
          >
            <TextInput
              data-testid="project-name-input"
              id="input-name"
              name="name"
              onChange={(_ev, value) => {
                setName(value);
              }}
              required
              value={name ?? ''}
            />
          </FormGroup>
          <FormGroup fieldId="input-display-name" label={t('Display name')}>
            <TextInput
              data-testid="project-display-name-input"
              id="input-display-name"
              name="displayName"
              onChange={(_ev, value) => {
                setDisplayName(value);
              }}
              value={displayName ?? ''}
            />
          </FormGroup>
          <FormGroup fieldId="input-description" label={t('Description')}>
            <TextArea
              id="input-description"
              name="description"
              onChange={(_ev, value) => {
                setDescription(value);
              }}
              resizeOrientation="vertical"
              value={description ?? ''}
            />
          </FormGroup>
          {errorMessage && (
            <Alert
              data-testid="create-project-modal-error-alert"
              isInline
              title={t('An error occurred')}
              variant={AlertVariant.danger}
            >
              <div className="create-project-modal__alert-text">{errorMessage}</div>
            </Alert>
          )}
        </Form>
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
