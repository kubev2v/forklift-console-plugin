import { Dispatch, useEffect } from 'react';
import { useImmerReducer } from 'use-immer';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
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

import {
  CreateVmMigration,
  initState,
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
import { CreateVmMigrationContextType } from './ProvidersCreateVmMigrationContext';
import { CreateVmMigrationPageState } from './types';

export const useFetchEffects = (
  createVmMigrationContext: CreateVmMigrationContextType,
): [CreateVmMigrationPageState, Dispatch<PageAction<CreateVmMigration, unknown>>, boolean] => {
  const {
    selectedVms,
    provider: sourceProvider,
    plan,
    netMap,
    storageMap,
    editAction,
  } = createVmMigrationContext?.data || {};

  // error state - the page was entered directly without choosing the VMs
  const emptyContext = !selectedVms?.length || !sourceProvider;
  const namespace = sourceProvider?.metadata?.namespace ?? '';

  const [state, dispatch] = useImmerReducer(
    reducer,
    { namespace, sourceProvider, selectedVms, plan, editAction },
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

  useEffect(
    () => !editingDone && dispatch(initState(namespace, sourceProvider, selectedVms, plan)),
    [selectedVms],
  );

  // debugger;
  const [providers, providersLoaded, providerError] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(() => {
    // Check if the response is wrapped or has the providers in the second element
    const actualProviders =
      Array.isArray(providers) && Array.isArray(providers[1])
        ? providers[1] // Extract providers from the second element
        : providers; // Or just return the original providers if it's already in the correct format

    return (
      !editingDone &&
      dispatchWithFallback(setAvailableProviders(actualProviders), !providersLoaded, providerError)
    );
  }, [providers, providersLoaded, providerError, selectedVms]);

  const [plans, plansLoaded, plansError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(() => {
    debugger;
    const existingPlans =
      editAction === 'VMS' ? plans.filter((p) => p.metadata.uid !== plan.metadata.uid) : plans;
    return (
      !editingDone &&
      dispatchWithFallback(setExistingPlans(existingPlans), !plansLoaded, plansError)
    );
  }, [plans, plansLoaded, plansError, selectedVms]);

  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(() => {
    debugger;
    return (
      !editingDone &&
      dispatchWithFallback(setExistingNetMaps(netMaps), !netMapsLoaded, netMapsError)
    );
  }, [netMaps, netMapsLoaded, netMapsError, selectedVms]);

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
    [stMaps, stMapsLoaded, stMapsError, selectedVms],
  );

  const [namespaces, nsLoading, nsError] = useNamespaces(targetProvider);
  useEffect(
    () =>
      targetProvider &&
      !editingDone &&
      dispatchWithFallback(setAvailableTargetNamespaces(namespaces), nsLoading, nsError),
    [namespaces, nsLoading, nsError, targetProvider, selectedVms],
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
    [targetNetworks, targetNetworksLoading, targetNetworksError, targetProvider, selectedVms],
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
    [sourceStorages, sourceStoragesLoading, sourceStoragesError, selectedVms],
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
    [targetStorages, targetStoragesLoading, targetStoragesError, targetProvider, selectedVms],
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
    [sourceNetworks, sourceNetworksLoading, sourceNetworksError, selectedVms],
  );

  const [nicProfiles, nicProfilesLoading, nicProfilesError] = useNicProfiles(sourceProvider);
  useEffect(
    () =>
      !editingDone &&
      dispatchWithFallback(setNicProfiles(nicProfiles), nicProfilesLoading, nicProfilesError),
    [nicProfiles, nicProfilesLoading, nicProfilesError, selectedVms],
  );

  const [disks, disksLoading, disksError] = useDisks(sourceProvider);
  useEffect(
    () => !editingDone && dispatchWithFallback(setDisks(disks), disksLoading, disksError),
    [disks, disksLoading, disksError, selectedVms],
  );

  return [state, dispatch, emptyContext];
};
