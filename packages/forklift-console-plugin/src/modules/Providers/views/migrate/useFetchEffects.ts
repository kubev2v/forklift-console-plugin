import { Dispatch, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useImmerReducer } from 'use-immer';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useDisks } from '../../hooks/useDisks';
import { useNamespaces } from '../../hooks/useNamespaces';
import { useOpenShiftNetworks, useSourceNetworks } from '../../hooks/useNetworks';
import { useNicProfiles } from '../../hooks/useNicProfiles';
import { useOpenShiftStorages, useSourceStorages } from '../../hooks/useStorages';
import { getResourceUrl } from '../../utils';

import {
  CreateVmMigration,
  PageAction,
  setAPiError,
  setAvailableProviders,
  setAvailableSourceNetworks,
  setAvailableSourceStorages,
  setAvailableTargetNamespaces,
  setAvailableTargetNetworks,
  setAvailableTargetStorages,
  setDisks,
  setExistingNetMaps,
  setExistingPlans,
  setExistingStorageMaps,
  setNicProfiles,
} from './reducer/actions';
import { createInitialState } from './reducer/createInitialState';
import { reducer } from './reducer/reducer';
import { useCreateVmMigrationData } from './ProvidersCreateVmMigrationContext';
import { CreateVmMigrationPageState } from './types';

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
    flow: { editingDone },
  } = state;

  const dispatchWithFallback = (
    action: PageAction<CreateVmMigration, unknown>,
    loading: boolean,
    error: Error,
  ): void => {
    if (loading) {
      return;
    }
    error ? dispatch(setAPiError(error)) : dispatch(action);
  };

  const [providers, providersLoaded, providerError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setAvailableProviders(providers), !providersLoaded, providerError),
    [providers],
  );

  const [plans, plansLoaded, plansError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () => !editingDone && dispatchWithFallback(setExistingPlans(plans), !plansLoaded, plansError),
    [plans, plansLoaded, plansError],
  );

  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setExistingNetMaps(netMaps), !netMapsLoaded, netMapsError),
    [netMaps, netMapsLoaded, netMapsError],
  );

  const [stMaps, stMapsLoaded, stMapsError] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setExistingStorageMaps(stMaps), !stMapsLoaded, stMapsError),
    [stMaps, stMapsLoaded, stMapsError],
  );

  const [namespaces, nsLoading, nsError] = useNamespaces(targetProvider);
  useEffect(
    () =>
      targetProvider &&
      !editingDone &&
      dispatchWithFallback(setAvailableTargetNamespaces(namespaces), nsLoading, nsError),
    [namespaces, nsLoading, nsError, targetProvider],
  );

  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  useEffect(
    () =>
      targetProvider &&
      !editingDone &&
      dispatchWithFallback(
        setAvailableTargetNetworks(targetNetworks),
        targetNetworksLoading,
        targetNetworksError,
      ),
    [targetNetworks, targetNetworksLoading, targetNetworksError, targetProvider],
  );

  const [sourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(
        setAvailableSourceStorages(sourceStorages),
        sourceStoragesLoading,
        sourceStoragesError,
      ),
    [sourceStorages, sourceStoragesLoading, sourceStoragesError],
  );

  const [targetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);
  useEffect(
    () =>
      targetProvider &&
      !editingDone &&
      dispatchWithFallback(
        setAvailableTargetStorages(targetStorages),
        targetStoragesLoading,
        targetStoragesError,
      ),
    [targetStorages, targetStoragesLoading, targetStoragesError, targetProvider],
  );

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(
        setAvailableSourceNetworks(sourceNetworks),
        sourceNetworksLoading,
        sourceNetworksError,
      ),
    [sourceNetworks, sourceNetworksLoading, sourceNetworksError],
  );

  const [nicProfiles, nicProfilesLoading, nicProfilesError] = useNicProfiles(sourceProvider);
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setNicProfiles(nicProfiles), nicProfilesLoading, nicProfilesError),
    [nicProfiles, nicProfilesLoading, nicProfilesError],
  );
  const [disks, disksLoading, disksError] = useDisks(sourceProvider);
  useEffect(
    () => !editingDone && dispatchWithFallback(setDisks(disks), disksLoading, disksError),
    [disks, disksLoading, disksError],
  );

  return [state, dispatch, emptyContext];
};
