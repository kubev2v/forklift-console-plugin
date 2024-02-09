import { Draft } from 'immer';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import { getIsTarget } from '../../../utils';
import {
  CreateVmMigrationPageState,
  Mapping,
  NET_MAP_NAME_REGENERATED,
  NetworkAlerts,
} from '../types';

import {
  ADD_NETWORK_MAPPING,
  ADD_STORAGE_MAPPING,
  CreateVmMigration,
  DEFAULT_NAMESPACE,
  DELETE_NETWORK_MAPPING,
  DELETE_STORAGE_MAPPING,
  PageAction,
  PlanAlert,
  PlanAvailableProviders,
  PlanAvailableSourceNetworks,
  PlanAvailableSourceStorages,
  PlanAvailableTargetNamespaces,
  PlanAvailableTargetNetworks,
  PlanAvailableTargetStorages,
  PlanDisks,
  PlanError,
  PlanExistingNetMaps,
  PlanExistingPlans,
  PlanMapping,
  PlanName,
  PlanNickProfiles,
  PlanTargetNamespace,
  PlanTargetProvider,
  POD_NETWORK,
  REMOVE_ALERT,
  REPLACE_NETWORK_MAPPING,
  REPLACE_STORAGE_MAPPING,
  SET_API_ERROR,
  SET_AVAILABLE_PROVIDERS,
  SET_AVAILABLE_SOURCE_NETWORKS,
  SET_AVAILABLE_SOURCE_STORAGES,
  SET_AVAILABLE_TARGET_NAMESPACES,
  SET_AVAILABLE_TARGET_NETWORKS,
  SET_AVAILABLE_TARGET_STORAGES,
  SET_DISKS,
  SET_EXISTING_NET_MAPS,
  SET_EXISTING_PLANS,
  SET_NAME,
  SET_NICK_PROFILES,
  SET_TARGET_NAMESPACE,
  SET_TARGET_PROVIDER,
  START_CREATE,
} from './actions';
import { addMapping, deleteMapping, replaceMapping } from './changeMapping';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
import {
  addIfMissing,
  alreadyInUseBySelectedVms,
  generateName,
  recalculateNetworks,
  recalculateStorages,
  setTargetNamespace,
  setTargetProvider,
  validatePlanName,
  validateTargetNamespace,
  validateUniqueName,
} from './helpers';
import { mapSourceNetworksToLabels, mapSourceStoragesToLabels } from './mapSourceToLabels';

const handlers: {
  [name: string]: (
    draft: Draft<CreateVmMigrationPageState>,
    action: PageAction<CreateVmMigration, unknown>,
  ) => CreateVmMigrationPageState | void;
} = {
  [SET_NAME](draft, { payload: { name } }: PageAction<CreateVmMigration, PlanName>) {
    if (draft.flow.editingDone) {
      return;
    }
    draft.underConstruction.plan.metadata.name = name;
    draft.validation.planName = validatePlanName(name, draft.existingResources.plans);
    return draft;
  },
  [SET_TARGET_NAMESPACE](
    draft,
    { payload: { targetNamespace } }: PageAction<CreateVmMigration, PlanTargetNamespace>,
  ) {
    if (!draft.flow.editingDone) {
      setTargetNamespace(draft, targetNamespace);
    }
    return draft;
  },
  [SET_TARGET_PROVIDER](
    draft,
    { payload: { targetProviderName } }: PageAction<CreateVmMigration, PlanTargetProvider>,
  ) {
    const {
      underConstruction: { plan },
      existingResources,
      flow: { editingDone },
    } = draft;
    // avoid side effects if no real change
    if (!editingDone && plan.spec.provider?.destination?.name !== targetProviderName) {
      setTargetProvider(draft, targetProviderName, existingResources.providers);
    }
    return draft;
  },
  [SET_AVAILABLE_PROVIDERS](
    draft,
    {
      payload: { availableProviders, loading },
    }: PageAction<CreateVmMigration, PlanAvailableProviders>,
  ) {
    const {
      flow,
      existingResources,
      underConstruction: { plan },
      workArea,
    } = draft;
    if (loading || flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_PROVIDERS, availableProviders);
    existingResources.providers = availableProviders;
    const oldTarget = workArea.targetProvider;
    const resolvedDestination = availableProviders
      .filter(getIsTarget)
      .find((p) => p?.metadata?.name === plan.spec.provider.destination?.name);
    if (!resolvedDestination && !oldTarget) {
      // case: no provider set (yet)
      // it's possible that there is no host provider in the namespace (empty will trigger error)
      const firstHostProvider = availableProviders.find((p) => isProviderLocalOpenshift(p));
      setTargetProvider(draft, firstHostProvider?.metadata?.name, availableProviders);
    } else if (!resolvedDestination) {
      // case: provider got removed in the meantime
      // notify the user by setting an empty provider (will trigger error)
      setTargetProvider(draft, undefined, availableProviders);
    }
  },
  [SET_EXISTING_PLANS](
    draft,
    { payload: { existingPlans, loading } }: PageAction<CreateVmMigration, PlanExistingPlans>,
  ) {
    // triggered from useEffect on any data change
    if (loading || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_EXISTING_PLANS, existingPlans);
    draft.existingResources.plans = existingPlans;
    draft.validation.planName = validatePlanName(
      draft.underConstruction.plan.metadata.name,
      existingPlans,
    );
    return draft;
  },
  [SET_AVAILABLE_TARGET_NAMESPACES](
    draft,
    {
      payload: { availableTargetNamespaces, loading },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNamespaces>,
  ) {
    // triggered from useEffect on any data change
    const {
      existingResources,
      validation,
      underConstruction: { plan },
      calculatedOnce: { namespacesUsedBySelectedVms },
      workArea: { targetProvider },
      flow: { editingDone },
      receivedAsParams: { sourceProvider },
    } = draft;
    if (loading || editingDone) {
      return;
    }
    console.warn(SET_AVAILABLE_TARGET_NAMESPACES, availableTargetNamespaces);
    existingResources.targetNamespaces = availableTargetNamespaces;

    const alreadyInUse = (namespace: string) =>
      alreadyInUseBySelectedVms({
        namespace,
        sourceProvider,
        targetProvider,
        namespacesUsedBySelectedVms,
      });

    validation.targetNamespace = validateTargetNamespace(
      plan.spec.targetNamespace,
      availableTargetNamespaces,
      alreadyInUse(plan.spec.targetNamespace),
    );
    if (validation.targetNamespace === 'success') {
      return draft;
    }

    const targetNamespace =
      // use the current namespace (inherited from source provider)
      (isProviderLocalOpenshift(targetProvider) &&
        !alreadyInUse(plan.metadata.namespace) &&
        plan.metadata.namespace) ||
      // use 'default' if exists
      (availableTargetNamespaces.find(
        (n) => n.name === DEFAULT_NAMESPACE && !alreadyInUse(DEFAULT_NAMESPACE),
      ) &&
        DEFAULT_NAMESPACE) ||
      // use the first from the list (if exists)
      availableTargetNamespaces.find((n) => !alreadyInUse(n.name))?.name;

    setTargetNamespace(draft, targetNamespace);
    return draft;
  },
  [SET_AVAILABLE_TARGET_NETWORKS](
    draft,
    {
      payload: { availableTargetNetworks, loading },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNetworks>,
  ) {
    // triggered from useEffect on any data change
    if (loading || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_TARGET_NETWORKS, availableTargetNetworks);
    draft.existingResources.targetNetworks = availableTargetNetworks;
    draft.flow.targetNetworksLoaded = true;

    recalculateNetworks(draft);
  },
  [SET_AVAILABLE_SOURCE_NETWORKS](
    draft,
    {
      payload: { availableSourceNetworks, loading },
    }: PageAction<CreateVmMigration, PlanAvailableSourceNetworks>,
  ) {
    if (loading || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_SOURCE_NETWORKS, availableSourceNetworks);
    draft.existingResources.sourceNetworks = availableSourceNetworks;
    draft.flow.sourceNetworkLoaded = true;

    draft.calculatedOnce.sourceNetworkLabelToId =
      mapSourceNetworksToLabels(availableSourceNetworks);

    recalculateNetworks(draft);
  },
  [SET_AVAILABLE_TARGET_STORAGES](
    draft,
    {
      payload: { availableTargetStorages, loading },
    }: PageAction<CreateVmMigration, PlanAvailableTargetStorages>,
  ) {
    // triggered from useEffect on any data change
    if (loading || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_TARGET_STORAGES, availableTargetStorages);
    draft.existingResources.targetStorages = availableTargetStorages;
    draft.flow.targetStoragesLoaded = true;

    recalculateStorages(draft);
  },
  [SET_AVAILABLE_SOURCE_STORAGES](
    draft,
    {
      payload: { availableSourceStorages, loading },
    }: PageAction<CreateVmMigration, PlanAvailableSourceStorages>,
  ) {
    // triggered from useEffect on any data change
    if (loading || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_SOURCE_STORAGES, availableSourceStorages);
    draft.existingResources.sourceStorages = availableSourceStorages;
    draft.flow.sourceStoragesLoaded = true;

    draft.calculatedOnce.sourceStorageLabelToId =
      mapSourceStoragesToLabels(availableSourceStorages);

    recalculateStorages(draft);
  },
  [SET_NICK_PROFILES](
    draft,
    { payload: { nickProfiles, loading } }: PageAction<CreateVmMigration, PlanNickProfiles>,
  ) {
    const {
      existingResources,
      calculatedOnce,
      receivedAsParams: { selectedVms },
      flow: { editingDone },
    } = draft;
    if (loading || editingDone) {
      return;
    }
    console.warn(SET_NICK_PROFILES, nickProfiles);
    existingResources.nickProfiles = nickProfiles;
    draft.flow.nicProfilesLoaded = true;

    calculatedOnce.networkIdsUsedBySelectedVms = getNetworksUsedBySelectedVms(
      selectedVms,
      nickProfiles,
    );
    recalculateNetworks(draft);
  },
  [SET_DISKS](draft, { payload: { disks, loading } }: PageAction<CreateVmMigration, PlanDisks>) {
    // triggered from useEffect on any data change
    const {
      existingResources,
      calculatedOnce,
      receivedAsParams: { selectedVms },
      flow: { editingDone },
    } = draft;
    if (loading || editingDone) {
      return;
    }
    console.warn(SET_DISKS, disks);
    existingResources.disks = disks;
    draft.flow.disksLoaded = true;

    calculatedOnce.storageIdsUsedBySelectedVms = getStoragesUsedBySelectedVms(selectedVms, disks);
    recalculateStorages(draft);
  },
  [SET_EXISTING_NET_MAPS](
    {
      existingResources,
      underConstruction: { netMap },
      receivedAsParams: { sourceProvider },
      flow: { editingDone },
      alerts,
    },
    { payload: { existingNetMaps, loading } }: PageAction<CreateVmMigration, PlanExistingNetMaps>,
  ) {
    // triggered from useEffect on any data change
    if (loading || editingDone) {
      return;
    }
    console.warn(SET_EXISTING_NET_MAPS, existingNetMaps);
    existingResources.netMaps = existingNetMaps;
    const oldName = netMap.metadata.name;
    const names = existingNetMaps.map((n) => n.metadata?.name).filter(Boolean);
    while (!validateUniqueName(netMap.metadata.name, names)) {
      netMap.metadata.name = generateName(sourceProvider.metadata.name);
    }
    if (oldName !== netMap.metadata.name) {
      addIfMissing<NetworkAlerts>(NET_MAP_NAME_REGENERATED, alerts.networkMappings.warnings);
    }
  },
  [START_CREATE]({
    flow,
    underConstruction: { plan, netMap, storageMap },
    calculatedOnce: { sourceNetworkLabelToId, sourceStorageLabelToId },
    calculatedPerNamespace: { networkMappings, storageMappings },
  }) {
    // triggered by the user
    console.warn(START_CREATE);
    flow.editingDone = true;
    netMap.spec.map = networkMappings.map(({ source, destination }) => ({
      source: {
        id: sourceNetworkLabelToId[source],
      },
      destination:
        destination === POD_NETWORK
          ? { type: 'pod' }
          : { name: destination, namespace: plan.spec.targetNamespace, type: 'multus' },
    }));
    storageMap.spec.map = storageMappings.map(({ source, destination }) => ({
      source: {
        id: sourceStorageLabelToId[source],
      },
      destination: { storageClass: destination },
    }));
  },
  [SET_API_ERROR]({ flow }, { payload: { error } }: PageAction<CreateVmMigration, PlanError>) {
    // triggered by the API callback (on failure)
    console.warn(SET_API_ERROR);
    flow.apiError = error;
  },
  [ADD_NETWORK_MAPPING]({ calculatedPerNamespace: cpn }) {
    const { sources, mappings } = addMapping(
      cpn.sourceNetworks,
      cpn.targetNetworks,
      cpn.networkMappings,
    );
    // triggered by the user
    console.warn(ADD_NETWORK_MAPPING, sources, mappings);
    if (sources && mappings) {
      cpn.sourceNetworks = sources;
      cpn.networkMappings = mappings;
    }
  },
  [DELETE_NETWORK_MAPPING](
    { calculatedPerNamespace: cpn },
    { payload: { source } }: PageAction<CreateVmMigration, Mapping>,
  ) {
    // triggered by the user
    const currentSource = cpn.sourceNetworks.find(
      ({ label, isMapped }) => label === source && isMapped,
    );
    console.warn(DELETE_NETWORK_MAPPING, source, currentSource);
    if (currentSource) {
      cpn.sourceNetworks = cpn.sourceNetworks.map((m) => ({
        ...m,
        isMapped: m.label === source ? false : m.isMapped,
      }));
      cpn.networkMappings = cpn.networkMappings.filter(
        ({ source }) => source !== currentSource.label,
      );
    }
  },
  [REPLACE_NETWORK_MAPPING](
    { calculatedPerNamespace: cpn },
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    // triggered by the user
    console.warn(REPLACE_NETWORK_MAPPING, current, next);
    const { sources, mappings } = replaceMapping(
      cpn.sourceNetworks,
      current,
      next,
      cpn.targetNetworks,
      cpn.networkMappings,
    );
    if (sources) {
      cpn.sourceNetworks = sources;
    }
    if (mappings) {
      cpn.networkMappings = mappings;
    }
  },
  [ADD_STORAGE_MAPPING]({ calculatedPerNamespace: cpn }) {
    const { sources, mappings } = addMapping(
      cpn.sourceStorages,
      cpn.targetStorages,
      cpn.storageMappings,
    );
    // triggered by the user
    console.warn(ADD_STORAGE_MAPPING, sources, mappings);
    if (sources && mappings) {
      cpn.sourceStorages = sources;
      cpn.storageMappings = mappings;
    }
  },
  [DELETE_STORAGE_MAPPING](
    { calculatedPerNamespace: cpn },
    { payload: { source } }: PageAction<CreateVmMigration, Mapping>,
  ) {
    // triggered by the user
    const { sources, mappings } = deleteMapping(cpn.sourceStorages, source, cpn.storageMappings);

    console.warn(DELETE_STORAGE_MAPPING, source, sources);
    if (sources && mappings) {
      cpn.sourceStorages = sources;
      cpn.storageMappings = mappings;
    }
  },
  [REPLACE_STORAGE_MAPPING](
    { calculatedPerNamespace: cpn },
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    // triggered by the user
    console.warn(REPLACE_STORAGE_MAPPING, current, next);
    const { sources, mappings } = replaceMapping(
      cpn.sourceStorages,
      current,
      next,
      cpn.targetStorages,
      cpn.storageMappings,
    );
    if (sources) {
      cpn.sourceStorages = sources;
    }
    if (mappings) {
      cpn.storageMappings = mappings;
    }
  },
  [REMOVE_ALERT](
    { alerts: { networkMappings, storageMappings, general } },
    { payload: { alertKey } }: PageAction<CreateVmMigration, PlanAlert>,
  ) {
    [
      networkMappings.errors,
      networkMappings.warnings,
      storageMappings.errors,
      storageMappings.warnings,
      general.errors,
      general.warnings,
    ].forEach((alerts) => {
      const index = alerts.findIndex((key) => key === alertKey);
      if (index > -1) {
        alerts.splice(index, 1);
      }
    });
  },
};

export const reducer = (
  draft: Draft<CreateVmMigrationPageState>,
  action: PageAction<CreateVmMigration, unknown>,
) => {
  return handlers?.[action?.type]?.(draft, action) ?? draft;
};
