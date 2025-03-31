import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components/Suspend';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import { providersSectionReducer, type ProvidersSectionState } from './state';

const initialState: ProvidersSectionState = {
  hasChanges: false,
  plan: null,
  sourceProviderMode: 'view',
  targetProviderMode: 'view',
  updating: false,
};

export const ProvidersSection: React.FC<ProvidersSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(providersSectionReducer, initialState);

  // Initialize the state with the prop obj
  React.useEffect(() => {
    dispatch({ payload: obj, type: 'INIT' });
  }, [obj]);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: obj.metadata.namespace,
    namespaced: true,
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

export type ProvidersSectionProps = {
  obj: V1beta1Plan;
};
