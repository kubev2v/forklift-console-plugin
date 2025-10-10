import { type FC, type FormEvent, type MouseEvent, useState } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC.tsx';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import ProjectNameHelp from '@components/modals/ProjectNameHelp.tsx';
import { k8sCreate, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { isUpstream } from '@utils/env.ts';
import { useForkliftTranslation } from '@utils/i18n';

import './CreateProjectModal.scss';

const UPSTREAM_LATEST = 'https://docs.okd.io/latest/';

const workingWithProjectsURLs = {
  downstream: 'html/building_applications/projects#working-with-projects',
  upstream: 'applications/projects/working-with-projects.html',
};

const projectDescriptionAnnotation = 'openshift.io/description';
const projectDisplayNameAnnotation = 'openshift.io/display-name';

type CreateProjectModalProps = {
  onCreated: (project: K8sResourceCommon) => void;
};

const CreateProjectModal: FC<CreateProjectModalProps> = ({ onCreated }) => {
  const { toggleModal } = useModal();
  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useForkliftTranslation();

  const submit = (event: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
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
        toggleModal();
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
    : `${window.SERVER_FLAGS.documentationBaseURL}${workingWithProjectsURLs.downstream}`;

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('Create project')}
      isOpen
      onClose={toggleModal}
      actions={[
        <Button
          type="submit"
          variant={ButtonVariant.primary}
          isLoading={inProgress}
          onClick={submit}
          id="confirm-action"
          data-testid="create-project-modal-create-button"
        >
          {t('Create project')}
        </Button>,
        <Button
          type="button"
          variant={ButtonVariant.secondary}
          disabled={inProgress}
          onClick={toggleModal}
          data-testid="create-project-modal-cancel-button"
        >
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Form onSubmit={submit} name="form">
        <Content>
          <Content component={ContentVariants.p}>
            {t(
              'A project, also known as a namespace, separates resources within clusters. It is an alternative representation of a Kubernetes namespace.',
            )}{' '}
            <ExternalLink href={projectsURL} isInline hideIcon>
              {t('Learn more about projects.')}
            </ExternalLink>
          </Content>
        </Content>
        <FormGroup
          fieldId="input-name"
          label={t('Name')}
          isRequired
          labelHelp={<ProjectNameHelp />}
        >
          <TextInput
            id="input-name"
            name="name"
            onChange={(_ev, value) => {
              setName(value);
            }}
            value={name ?? ''}
            required
            data-testid="project-name-input"
          />
        </FormGroup>
        <FormGroup fieldId="input-display-name" label={t('Display name')}>
          <TextInput
            id="input-display-name"
            name="displayName"
            onChange={(_ev, value) => {
              setDisplayName(value);
            }}
            value={displayName ?? ''}
            data-testid="project-display-name-input"
          />
        </FormGroup>
        <FormGroup fieldId="input-description" label={t('Description')}>
          <TextArea
            id="input-description"
            name="description"
            resizeOrientation="vertical"
            onChange={(_ev, value) => {
              setDescription(value);
            }}
            value={description ?? ''}
          />
        </FormGroup>
        {errorMessage && (
          <Alert
            isInline
            variant={AlertVariant.danger}
            title={t('An error occurred')}
            data-testid="create-project-modal-error-alert"
          >
            <div className="create-project-modal__alert-text">{errorMessage}</div>
          </Alert>
        )}
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
