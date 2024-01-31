import { Dispatch, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useImmerReducer } from 'use-immer';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useNamespaces } from '../../hooks/useNamespaces';
import { useOpenShiftNetworks, useSourceNetworks } from '../../hooks/useNetworks';
import { useNicProfiles } from '../../hooks/useNicProfiles';
import { getResourceUrl } from '../../utils';

import {
  CreateVmMigration,
  PageAction,
  setAvailableProviders,
  setAvailableSourceNetworks,
  setAvailableTargetNamespaces,
  setAvailableTargetNetworks,
  setExistingNetMaps,
  setExistingPlans,
  setNicProfiles,
} from './actions';
import { useCreateVmMigrationData } from './ProvidersCreateVmMigrationContext';
import { CreateVmMigrationPageState, reducer } from './reducer';
import { createInitialState } from './stateHelpers';

export const useFetchEffects = (): [
  CreateVmMigrationPageState,
  Dispatch<PageAction<CreateVmMigration, unknown>>,
  boolean,
] => {
  const history = useHistory();

  const { data: { selectedVms = [], provider: sourceProvider = undefined } = {} } =
    useCreateVmMigrationData();
  // error state - the page was entered directly without choosing the VMs
  const emptyContext = !selectedVms?.length || !sourceProvider;
  const namespace = sourceProvider?.metadata?.namespace ?? '';
  // error recovery - redirect to provider list
  useEffect(() => {
    if (emptyContext) {
      history.push(
        getResourceUrl({
          reference: ProviderModelRef,
          namespace: namespace,
        }),
      );
    }
  }, [emptyContext]);

  const [state, dispatch] = useImmerReducer(
    reducer,
    { namespace, sourceProvider, selectedVms },
    createInitialState,
  );
  const {
    workArea: { targetProvider },
  } = state;

  const [providers, providersLoaded, providerError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () => dispatch(setAvailableProviders(providers, providersLoaded, providerError)),
    [providers],
  );

  const [plans, plansLoaded, plansError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () => dispatch(setExistingPlans(plans, plansLoaded, plansError)),
    [plans, plansLoaded, plansError],
  );

  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () => dispatch(setExistingNetMaps(netMaps, netMapsLoaded, netMapsError)),
    [netMaps, netMapsLoaded, netMapsError],
  );

  const [namespaces, nsLoading, nsError] = useNamespaces(targetProvider);
  useEffect(
    () => dispatch(setAvailableTargetNamespaces(namespaces, nsLoading, nsError)),
    [namespaces, nsLoading, nsError],
  );

  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  useEffect(
    () =>
      dispatch(
        setAvailableTargetNetworks(targetNetworks, targetNetworksLoading, targetNetworksError),
      ),
    [targetNetworks, targetNetworksLoading, targetNetworksError],
  );

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  useEffect(
    () =>
      dispatch(
        setAvailableSourceNetworks(sourceNetworks, sourceNetworksLoading, sourceNetworksError),
      ),
    [sourceNetworks, sourceNetworksLoading, sourceNetworksError],
  );

  const [nicProfiles, nicProfilesLoading, nicProfilesError] = useNicProfiles(sourceProvider);
  useEffect(
    () => dispatch(setNicProfiles(nicProfiles, nicProfilesLoading, nicProfilesError)),
    [nicProfiles, nicProfilesLoading, nicProfilesError],
  );
  return [state, dispatch, emptyContext];
};
