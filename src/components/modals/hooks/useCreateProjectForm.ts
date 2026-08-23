import { type MouseEvent, useState } from 'react';

import { k8sCreate, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ProjectModel } from '@openshift-console/dynamic-plugin-sdk/lib/models';
import { useForkliftTranslation } from '@utils/i18n';

const projectDescriptionAnnotation = 'openshift.io/description';
const projectDisplayNameAnnotation = 'openshift.io/display-name';

type UseCreateProjectFormArgs = {
  closeOverlay: () => void;
  onCreated: (project: K8sResourceCommon) => void;
};

type UseCreateProjectFormResult = {
  description: string;
  displayName: string;
  errorMessage: string;
  inProgress: boolean;
  name: string;
  setDescription: (value: string) => void;
  setDisplayName: (value: string) => void;
  setName: (value: string) => void;
  submit: (event: MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => void;
};

export const useCreateProjectForm = ({
  closeOverlay,
  onCreated,
}: UseCreateProjectFormArgs): UseCreateProjectFormResult => {
  const { t } = useForkliftTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const submit = (
    event: MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>,
  ): void => {
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
        const err = error.message ?? t('An error occurred. Please try again.');
        setErrorMessage(err);
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  return {
    description,
    displayName,
    errorMessage,
    inProgress,
    name,
    setDescription,
    setDisplayName,
    setName,
    submit,
  };
};
