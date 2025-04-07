import { type FC, Suspense } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { ResourceYAMLEditor, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type ProviderYAMLPageProps = {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ProviderYAMLPage: FC<ProviderYAMLPageProps> = ({ loaded, loadError, obj }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {provider && loaded && !loadError && (
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={provider} />
      )}
    </Suspense>
  );
};

const Loading: FC = () => (
  <div className="co-m-loader co-an-fade-in-out" data-testid="loading-indicator-provider-yaml">
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export const ProviderYAMLPageWrapper: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const data = { provider };

  return <ProviderYAMLPage obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
