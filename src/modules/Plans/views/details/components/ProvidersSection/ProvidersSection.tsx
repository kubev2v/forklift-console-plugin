import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components/Suspend';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import { providersSectionReducer, ProvidersSectionState } from './state/reducer';

const initialState: ProvidersSectionState = {
  plan: null,
  sourceProviderMode: 'view',
  targetProviderMode: 'view',
  hasChanges: false,
  updating: false,
};

export const ProvidersSection: React.FC<ProvidersSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(providersSectionReducer, initialState);

  // Initialize the state with the prop obj
  React.useEffect(() => {
    dispatch({ type: 'INIT', payload: obj });
  }, [obj]);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: obj.metadata.namespace,
  });

  return (
    <Suspend obj={providers} loaded={providersLoaded} loadError={providersLoadError}>
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <DetailsItem
          title={t('Source provider')}
          content={
            <ResourceLink
              inline
              name={state.plan?.spec?.provider?.source?.name}
              namespace={state.plan?.spec?.provider?.source?.namespace}
              groupVersionKind={ProviderModelGroupVersionKind}
            />
          }
          helpContent={'source provider'}
          crumbs={['spec', 'providers', 'source']}
        />

        <DetailsItem
          title={t('Target provider')}
          content={
            <ResourceLink
              inline
              name={state.plan?.spec?.provider?.destination?.name}
              namespace={state.plan?.spec?.provider?.destination?.namespace}
              groupVersionKind={ProviderModelGroupVersionKind}
            />
          }
          helpContent={'destination provider'}
          crumbs={['spec', 'providers', 'destination']}
        />
      </DescriptionList>
    </Suspend>
  );
};

type ProvidersSectionProps = {
  obj: V1beta1Plan;
};
