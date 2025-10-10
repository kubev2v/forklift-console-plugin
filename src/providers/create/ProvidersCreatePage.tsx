import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { produce } from 'immer';
import { encode } from 'js-base64';
import { useK8sWatchProviderNames } from 'src/modules/Providers/hooks/useK8sWatchProviderNames';
import useToggle from 'src/modules/Providers/hooks/useToggle';
import { useForkliftTranslation } from 'src/utils/i18n';
import { getDefaultNamespace } from 'src/utils/namespaces';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { Divider, Form, PageSection } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getSdkEndpoint } from '@utils/crds/common/selectors';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';
import { type ValidationMsg, ValidationState } from '../utils/types';
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
}> = ({ namespace: activeNamespace }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const [isLoading, toggleIsLoading] = useToggle();
  const [providerNames, providerNamesLoaded] = useK8sWatchProviderNames({
    namespace: activeNamespace,
  });
  const initialProjectName = activeNamespace ?? getDefaultNamespace();
  const [apiError, setApiError] = useState<Error | null>();
  const [validationError, setValidationError] = useState<ValidationMsg>({
    msg: t('Missing provider name'),
    type: ValidationState.Error,
  });
  const [projectName, setProjectName] = useState<string>(initialProjectName);
  const [newProvider, setNewProvider] = useState<V1beta1Provider>(
    getProviderTemplateWithNamespace(initialProjectName),
  );
  const [newSecret, setNewSecret] = useState<IoK8sApiCoreV1Secret>(
    getSecretTemplateWithNamespace(initialProjectName),
  );

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
    setProjectName(newValue);
  };

  const onUpdate = async () => {
    toggleIsLoading();

    const vsphereEndpointData = newProvider.spec?.type === 'vsphere' && {
      vsphereEndpointType: getSdkEndpoint(newProvider),
    };

    trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_STARTED, {
      namespace: projectName,
      providerType: newProvider.spec?.type,
      ...vsphereEndpointData,
    });

    try {
      const secret: IoK8sApiCoreV1Secret | undefined = await createProviderSecret(
        newProvider,
        produce(newSecret, (draft) => {
          if (projectName) {
            if (draft?.metadata) draft.metadata.namespace = projectName;
          }
        }),
      );

      const provider: V1beta1Provider | undefined = await createProvider(
        produce(newProvider, (draft) => {
          if (projectName) {
            if (draft?.metadata) draft.metadata.namespace = projectName;
          }
        }),
        secret!,
      );

      // set secret ownership using provider uid
      await patchProviderSecretOwner(provider, secret);

      trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_COMPLETED, {
        hasVddk: Boolean(newSecret.data?.vddkImage),
        namespace: projectName,
        providerType: provider?.spec?.type,
        ...(provider?.spec?.type === 'vsphere' && {
          vsphereEndpointType: getSdkEndpoint(provider),
        }),
      });

      // navigate to providers derails page
      const providerURL = getProviderDetailsPageUrl(provider);

      navigate(providerURL);
    } catch (err) {
      trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_FAILED, {
        error: err instanceof Error ? err.message : 'Unknown error',
        namespace: projectName,
        providerType: newProvider.spec?.type,
        ...vsphereEndpointData,
      });

      setApiError(err as Error | null);
      toggleIsLoading();
    }
  };

  return (
    <Form>
      <PageSection hasBodyWrapper={false}>
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
          activeNamespace={activeNamespace}
          validationError={validationError}
          isLoading={isLoading}
          onUpdate={onUpdate}
        />
      </PageSection>
    </Form>
  );
};

export default ProvidersCreatePage;
