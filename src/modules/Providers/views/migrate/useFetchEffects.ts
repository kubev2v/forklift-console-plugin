import { type Dispatch, useEffect } from 'react';
import { useImmerReducer } from 'use-immer';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { useDisks } from '../../hooks/useDisks';
import { useNamespaces } from '../../hooks/useNamespaces';
import { useOpenShiftNetworks, useSourceNetworks } from '../../hooks/useNetworks';
import { useNicProfiles } from '../../hooks/useNicProfiles';
import { useOpenShiftStorages, useSourceStorages } from '../../hooks/useStorages';

import {
  type CreateVmMigration,
  initState,
  type PageAction,
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
  setSelectedVms,
  setSourceProvider,
} from './reducer/actions';
import { createInitialState } from './reducer/createInitialState';
import { reducer } from './reducer/reducer';
import type { CreateVmMigrationContextType } from './ProvidersCreateVmMigrationContext';
import type { CreateVmMigrationPageState } from './types';

export const useFetchEffects = (
  createVmMigrationContext: CreateVmMigrationContextType,
): [CreateVmMigrationPageState, Dispatch<PageAction<CreateVmMigration, unknown>>, boolean] => {
  const {
    planName,
    projectName,
    provider: sourceProvider,
    selectedVms,
  } = createVmMigrationContext?.data || {};

  // error state - the page was entered directly without choosing the VMs
  const emptyContext = !selectedVms?.length || !sourceProvider;
  const namespace = sourceProvider?.metadata?.namespace ?? '';

  const [state, dispatch] = useImmerReducer(
    reducer,
    { namespace, planName, projectName, selectedVms, sourceProvider },
    createInitialState,
  );

  const {
    flow: { editingDone },
    workArea: { targetProvider },
  } = state;
  const targetProviderName = targetProvider?.metadata?.name;

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

  useEffect(
    () =>
      !editingDone &&
      dispatch(initState(namespace, planName, projectName, sourceProvider, selectedVms)),
    [],
  );

  useEffect(() => {
    if (!editingDone && selectedVms?.length) {
      dispatch(setSelectedVms(selectedVms, sourceProvider));
    }
  }, [editingDone, selectedVms, sourceProvider]);

  useEffect(() => {
    if (!editingDone && sourceProvider) {
      dispatch(setSourceProvider(sourceProvider));
    }
  }, [editingDone, sourceProvider]);

  const [providers, providersLoaded, providerError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setAvailableProviders(providers), !providersLoaded, providerError),
    [editingDone, providersLoaded, providerError?.message, selectedVms],
  );

  const [plans, plansLoaded, plansError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  useEffect(
    () => !editingDone && dispatchWithFallback(setExistingPlans(plans), !plansLoaded, plansError),
    [editingDone, plansLoaded, plansError?.message, selectedVms],
  );

  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setExistingNetMaps(netMaps), !netMapsLoaded, netMapsError),
    [editingDone, netMapsLoaded, netMapsError?.message, selectedVms],
  );

  const [stMaps, stMapsLoaded, stMapsError] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setExistingStorageMaps(stMaps), !stMapsLoaded, stMapsError),
    [editingDone, stMapsLoaded, stMapsError?.message, selectedVms],
  );

  const [namespaces, nsLoading, nsError] = useNamespaces(targetProvider);
  useEffect(
    () =>
      targetProviderName &&
      !editingDone &&
      dispatchWithFallback(setAvailableTargetNamespaces(namespaces), nsLoading, nsError),
    [editingDone, nsLoading, nsError?.message, targetProviderName, selectedVms],
  );

  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  useEffect(
    () =>
      targetProviderName &&
      !editingDone &&
      dispatchWithFallback(
        setAvailableTargetNetworks(targetNetworks),
        targetNetworksLoading,
        targetNetworksError,
      ),
    [
      editingDone,
      targetNetworksLoading,
      targetNetworksError?.message,
      targetProviderName,
      selectedVms,
    ],
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
    [editingDone, sourceStoragesLoading, sourceStoragesError?.message, selectedVms, sourceProvider],
  );

  const [targetStorages, targetStoragesLoading, targetStoragesError] =
    useOpenShiftStorages(targetProvider);
  useEffect(
    () =>
      targetProviderName &&
      !editingDone &&
      dispatchWithFallback(
        setAvailableTargetStorages(targetStorages),
        targetStoragesLoading,
        targetStoragesError,
      ),
    [editingDone, targetStoragesLoading, targetProviderName, selectedVms],
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
    [editingDone, sourceNetworksLoading, sourceNetworksError?.message, selectedVms, sourceProvider],
  );

  const [nicProfiles, nicProfilesLoading, nicProfilesError] = useNicProfiles(sourceProvider);
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setNicProfiles(nicProfiles), nicProfilesLoading, nicProfilesError),
    [editingDone, nicProfilesLoading, nicProfilesError?.message, selectedVms],
  );

  const [disks, disksLoading, disksError] = useDisks(sourceProvider);
  useEffect(
    () => !editingDone && dispatchWithFallback(setDisks(disks), disksLoading, disksError),
    [editingDone, disksLoading, disksError?.message, selectedVms],
  );

  return [state, dispatch, emptyContext];
};
