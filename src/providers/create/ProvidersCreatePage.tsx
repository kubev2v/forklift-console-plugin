import { type FC, useState } from 'react';
import { useHistory } from 'react-router';
import { encode } from 'js-base64';
import { useK8sWatchProviderNames } from 'src/modules/Providers/hooks/useK8sWatchProviderNames';
import useToggle from 'src/modules/Providers/hooks/useToggle';
import { Namespace } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';
import { getDefaultNamespace } from 'src/utils/namespaces';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Form, PageSection } from '@patternfly/react-core';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';
import { type ValidationMsg, ValidationState } from '../utils/types';
import { validateProjectName } from '../utils/validators/validateProjectName';
import { validateProviderAndSecret } from '../utils/validators/validateProviderAndSecret';

import ProviderCreateActionsSection from './components/ProviderCreateActionsSection';
import ProvidersCreateFormsSection from './components/ProvidersCreateFormsSection';
import ProvidersCreatePageHeader from './components/ProvidersCreatePageHeader';
import { createProvider } from './utils/createProvider';
import { createProviderSecret } from './utils/createProviderSecret';
import { patchProviderSecretOwner } from './utils/patchProviderSecretOwner';
import { getProviderTemplateWithNamespace } from './utils/providerTemplates';
import { getSecretTemplateWithNamespace } from './utils/secretTemplates';

import './ProvidersCreatePage.style.scss';

const ProvidersCreatePage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const [isLoading, toggleIsLoading] = useToggle();
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const [providerNames, providerNamesLoaded] = useK8sWatchProviderNames({ namespace });

  const defaultNamespace = getDefaultNamespace();
  const initialProjectName =
    activeNamespace === Namespace.AllProjects ? defaultNamespace : activeNamespace;
  const initialNamespace = namespace || initialProjectName || defaultNamespace;
  const [apiError, setApiError] = useState<Error | null>();
  const [validationError, setValidationError] = useState<ValidationMsg>({
    msg: t('Missing provider name'),
    type: ValidationState.Error,
  });
  const [newProvider, setNewProvider] = useState<V1beta1Provider>(
    getProviderTemplateWithNamespace(initialNamespace),
  );
  const [newSecret, setNewSecret] = useState<IoK8sApiCoreV1Secret>(
    getSecretTemplateWithNamespace(initialNamespace),
  );
  const [projectName, setProjectName] = useState<string>(initialProjectName);

  if (!newSecret) {
    return <span className="text-muted">{t('No credentials found.')}</span>;
  }

  const onNewSecretChange = (newValue: IoK8sApiCoreV1Secret) => {
    setApiError(null);
    setValidationError(validateProviderAndSecret(newProvider, newValue, providerNames));
    setNewSecret(newValue);
  };

  const onNewProviderChange = (newValue: V1beta1Provider) => {
    setApiError(null);
    setValidationError(validateProviderAndSecret(newValue, newSecret, providerNames));
    // Sync secret with new URL
    const updatedSecret = {
      ...newSecret,
      data: { ...newSecret.data, url: encode(newValue?.spec?.url ?? '') },
    };
    setNewProvider(newValue);
    setNewSecret(updatedSecret);
  };

  const onProjectNameChange = (newValue: string) => {
    setApiError(null);
    setValidationError(validateProjectName(newValue));
    setProjectName(newValue);
  };

  const onUpdate = async () => {
    toggleIsLoading();

    try {
      const secret: IoK8sApiCoreV1Secret | undefined = await createProviderSecret(newProvider, {
        ...newSecret,
        ...(projectName && {
          metadata: { ...newSecret.metadata, namespace: projectName },
        }),
      });

      const provider: V1beta1Provider | undefined = await createProvider(
        {
          ...newProvider,
          ...(projectName && {
            metadata: { ...newProvider.metadata, namespace: projectName },
          }),
        },
        secret!,
      );

      // set secret ownership using provider uid
      await patchProviderSecretOwner(provider, secret);

      // navigate to providers derails page
      const providerURL = getProviderDetailsPageUrl(provider);

      history.push(providerURL);
    } catch (err) {
      setApiError(err as Error | null);
      toggleIsLoading();
    }
  };

  return (
    <Form>
      <PageSection variant="light">
        <ProvidersCreatePageHeader apiError={apiError} />

        <ProvidersCreateFormsSection
          newProvider={newProvider}
          newSecret={newSecret}
          projectName={projectName}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
          onProjectNameChange={onProjectNameChange}
          providerNames={providerNames}
          providerNamesLoaded={providerNamesLoaded}
        />

        <Divider className="forklift-section-create-divider" />

        <ProviderCreateActionsSection
          newProvider={newProvider}
          projectName={projectName}
          namespace={namespace}
          validationError={validationError}
          isLoading={isLoading}
          setActiveNamespace={setActiveNamespace}
          onUpdate={onUpdate}
        />
      </PageSection>
    </Form>
  );
};

export default ProvidersCreatePage;
