import React, { useReducer } from 'react';
import { Suspend } from 'src/modules/Plans/views/details/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  PlanModel,
  ProviderModelGroupVersionKind,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, DescriptionList, Flex, FlexItem, Spinner } from '@patternfly/react-core';

import { ProvidersEdit } from './components';
import { providersSectionReducer, ProvidersSectionState } from './state';

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

  const targetProviders = providers.filter((p) => ['openshift'].includes(p?.spec?.type));

  const onUpdate = async () => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    await k8sUpdate({ model: PlanModel, data: state.plan });
  };

  return (
    <Suspend obj={providers} loaded={providersLoaded} loadError={providersLoadError}>
      <Flex className="forklift-network-map__details-tab--update-button">
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.hasChanges || state.updating}
            icon={state.updating ? <Spinner size="sm" /> : undefined}
          >
            {t('Update providers')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'INIT', payload: obj })}
            isDisabled={!state.hasChanges || state.updating}
          >
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>

      <DescriptionList
        columnModifier={{
          default: '1Col',
        }}
      >
        <ProvidersEdit
          providers={providers}
          selectedProviderName={state.plan?.spec?.provider?.source?.name}
          label={t('Source provider')}
          placeHolderLabel={t('Select a provider')}
          onChange={(value) =>
            dispatch({
              type: 'SET_SOURCE_PROVIDER',
              payload: providers.find((p) => p?.metadata?.name === value),
            })
          }
          invalidLabel={t('The chosen provider is no longer available.')}
          mode={state.sourceProviderMode}
          helpContent="source provider"
          setMode={() => dispatch({ type: 'SET_SOURCE_PROVIDER_MODE', payload: 'edit' })}
        />

        <ProvidersEdit
          providers={targetProviders}
          selectedProviderName={state.plan?.spec?.provider?.destination?.name}
          label={t('Target provider')}
          placeHolderLabel={t('Select a provider')}
          onChange={(value) =>
            dispatch({
              type: 'SET_TARGET_PROVIDER',
              payload: providers.find((p) => p?.metadata?.name === value),
            })
          }
          invalidLabel={t('The chosen provider is no longer available.')}
          mode={state.targetProviderMode}
          helpContent="Target provider"
          setMode={() => dispatch({ type: 'SET_TARGET_PROVIDER_MODE', payload: 'edit' })}
        />
      </DescriptionList>
    </Suspend>
  );
};

export type ProvidersSectionProps = {
  obj: V1beta1Plan;
};
