import { type FC, type FormEvent, useEffect, useReducer } from 'react';
import { updateNetworkMapDestination } from 'src/modules/NetworkMaps/utils/helpers/updateNetworkMapDestination';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  NetworkMapModel,
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Provider,
} from '@kubev2v/types';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';

import { ProvidersEdit } from './components/ProvidersEdit';
import { providersSectionReducer, type ProvidersSectionState } from './state/reducer';

const initialState: ProvidersSectionState = {
  hasChanges: false,
  networkMap: null,
  sourceProviderMode: 'view',
  targetProviderMode: 'view',
  updating: false,
};

export const ProvidersSection: FC<ProvidersSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [state, dispatch] = useReducer(providersSectionReducer, initialState);

  // Initialize the state with the prop obj
  useEffect(() => {
    dispatch({ payload: obj, type: 'INIT' });
  }, [obj]);

  const [providers, providersLoaded, providersLoadError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: obj.metadata?.namespace,
    namespaced: true,
  });

  const targetProviders = providers.filter(
    (provider) => provider?.spec?.type && ['openshift'].includes(provider.spec.type),
  );

  const onUpdate = async () => {
    if (state.networkMap) {
      dispatch({ payload: true, type: 'SET_UPDATING' });
      await k8sUpdate({
        data: updateNetworkMapDestination(state.networkMap),
        model: NetworkMapModel,
      });
    }
  };

  const onClick = () => {
    dispatch({ payload: obj, type: 'INIT' });
  };

  const onChangeSource: (value: string, event: FormEvent<HTMLSelectElement>) => void = (value) => {
    const payload = providers.find((provider) => provider?.metadata?.name === value);
    if (payload) {
      dispatch({ payload, type: 'SET_SOURCE_PROVIDER' });
    }
  };

  const onChangeTarget: (value: string, event: FormEvent<HTMLSelectElement>) => void = (value) => {
    const payload = providers.find((provider) => provider?.metadata?.name === value);
    if (payload) {
      dispatch({ payload, type: 'SET_TARGET_PROVIDER' });
    }
  };

  return (
    <LoadingSuspend obj={providers} loaded={providersLoaded} loadError={providersLoadError}>
      <Flex className="forklift-network-map__details-tab--update-button">
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            onClick={onUpdate}
            isDisabled={!state.hasChanges || state.updating}
            icon={state.updating ? <Spinner size="sm" /> : undefined}
          >
            {t('Update providers')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button
            variant={ButtonVariant.secondary}
            onClick={onClick}
            isDisabled={!state.hasChanges || state.updating}
          >
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>

      <DescriptionList
        className="pf-v6-u-mt-md"
        columnModifier={{
          default: '1Col',
        }}
      >
        <ProvidersEdit
          providers={providers}
          selectedProviderName={state.networkMap?.spec?.provider?.source?.name ?? ''}
          label={t('Source provider')}
          placeHolderLabel={t('Select a provider')}
          onChange={onChangeSource}
          invalidLabel={t('The chosen provider is no longer available.')}
          mode={state.sourceProviderMode}
          helpContent="source provider"
          setMode={() => {
            dispatch({ payload: 'edit', type: 'SET_SOURCE_PROVIDER_MODE' });
          }}
        />

        <ProvidersEdit
          providers={targetProviders}
          selectedProviderName={state.networkMap?.spec?.provider?.destination?.name ?? ''}
          label={t('Target provider')}
          placeHolderLabel={t('Select a provider')}
          onChange={onChangeTarget}
          invalidLabel={t('The chosen provider is no longer available.')}
          mode={state.targetProviderMode}
          helpContent="Target provider"
          setMode={() => {
            dispatch({ payload: 'edit', type: 'SET_TARGET_PROVIDER_MODE' });
          }}
        />
      </DescriptionList>
    </LoadingSuspend>
  );
};

type ProvidersSectionProps = {
  obj: V1beta1NetworkMap;
};
