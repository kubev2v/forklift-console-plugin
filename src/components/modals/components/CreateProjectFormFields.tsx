import type { FC } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import ProjectNameHelp from '@components/modals/ProjectNameHelp';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getProjectsDocumentationUrl } from '../utils/projectsDocumentationUrl';

type CreateProjectFormFieldsProps = {
  description: string;
  displayName: string;
  errorMessage: string;
  name: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  setDescription: (value: string) => void;
  setDisplayName: (value: string) => void;
  setName: (value: string) => void;
};

const CreateProjectFormFields: FC<CreateProjectFormFieldsProps> = ({
  description,
  displayName,
  errorMessage,
  name,
  onSubmit,
  setDescription,
  setDisplayName,
  setName,
}) => {
  const { t } = useForkliftTranslation();
  const projectsURL = getProjectsDocumentationUrl();

  return (
    <Form name="form" onSubmit={onSubmit}>
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
      <FormGroup fieldId="input-name" isRequired label={t('Name')} labelHelp={<ProjectNameHelp />}>
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
  );
};

export default CreateProjectFormFields;
