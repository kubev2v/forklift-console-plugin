import { Draft } from 'immer';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import { getIsTarget } from '../../../utils';
import {
  CreateVmMigrationPageState,
  Mapping,
  MULTIPLE_NICS_ON_THE_SAME_NETWORK,
  NET_MAP_NAME_REGENERATED,
  NetworkAlerts,
  STORAGE_MAP_NAME_REGENERATED,
  StorageAlerts,
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
  PlanExistingStorageMaps,
  PlanMapping,
  PlanName,
  PlanNicProfiles,
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
  SET_EXISTING_STORAGE_MAPS,
  SET_NAME,
  SET_NICK_PROFILES,
  SET_TARGET_NAMESPACE,
  SET_TARGET_PROVIDER,
  START_CREATE,
} from './actions';
import { addMapping, deleteMapping, replaceMapping } from './changeMapping';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
import { hasMultipleNicsOnTheSameNetwork } from './hasMultipleNicsOnTheSameNetwork';
import {
  addIfMissing,
  alreadyInUseBySelectedVms,
  executeNetworkMappingValidation,
  executeStorageMappingValidation,
  generateUniqueName,
  recalculateNetworks,
  recalculateStorages,
  setTargetNamespace,
  setTargetProvider,
  validatePlanName,
  validateTargetNamespace,
} from './helpers';
import { mapSourceNetworksToLabels, mapSourceStoragesToLabels } from './mapSourceToLabels';

const handlers: {
  [name: string]: (
    draft: Draft<CreateVmMigrationPageState>,
    action: PageAction<CreateVmMigration, unknown>,
  ) => CreateVmMigrationPageState | void;
} = {
  [SET_NAME](draft, { payload: { name } }: PageAction<CreateVmMigration, PlanName>) {
    draft.underConstruction.plan.metadata.name = name;
    draft.validation.planName = validatePlanName(name, draft.existingResources.plans);
  },
  [SET_TARGET_NAMESPACE](
    draft,
    { payload: { targetNamespace } }: PageAction<CreateVmMigration, PlanTargetNamespace>,
  ) {
    setTargetNamespace(draft, targetNamespace);
  },
  [SET_TARGET_PROVIDER](
    draft,
    { payload: { targetProviderName } }: PageAction<CreateVmMigration, PlanTargetProvider>,
  ) {
    const {
      underConstruction: { plan },
      existingResources,
    } = draft;
    // avoid side effects if no real change
    if (plan.spec.provider?.destination?.name !== targetProviderName) {
      setTargetProvider(draft, targetProviderName, existingResources.providers);
    }
  },
  [SET_AVAILABLE_PROVIDERS](
    draft,
    { payload: { availableProviders } }: PageAction<CreateVmMigration, PlanAvailableProviders>,
  ) {
    const {
      existingResources,
      underConstruction: { plan },
      workArea,
    } = draft;
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
    { payload: { existingPlans } }: PageAction<CreateVmMigration, PlanExistingPlans>,
  ) {
    // triggered from useEffect on any data change
    draft.existingResources.plans = existingPlans;
    draft.validation.planName = validatePlanName(
      draft.underConstruction.plan.metadata.name,
      existingPlans,
    );
  },
  [SET_AVAILABLE_TARGET_NAMESPACES](
    draft,
    {
      payload: { availableTargetNamespaces },
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
    if (editingDone) {
      return;
    }
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
      payload: { availableTargetNetworks },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNetworks>,
  ) {
    // triggered from useEffect on any data change
    draft.existingResources.targetNetworks = availableTargetNetworks;
    recalculateNetworks(draft);
  },
  [SET_AVAILABLE_SOURCE_NETWORKS](
    draft,
    {
      payload: { availableSourceNetworks },
    }: PageAction<CreateVmMigration, PlanAvailableSourceNetworks>,
  ) {
    draft.existingResources.sourceNetworks = availableSourceNetworks;

    draft.calculatedOnce.sourceNetworkLabelToId =
      mapSourceNetworksToLabels(availableSourceNetworks);

    recalculateNetworks(draft);
  },
  [SET_AVAILABLE_TARGET_STORAGES](
    draft,
    {
      payload: { availableTargetStorages },
    }: PageAction<CreateVmMigration, PlanAvailableTargetStorages>,
  ) {
    // triggered from useEffect on any data change
    draft.existingResources.targetStorages = availableTargetStorages;

    recalculateStorages(draft);
  },
  [SET_AVAILABLE_SOURCE_STORAGES](
    draft,
    {
      payload: { availableSourceStorages },
    }: PageAction<CreateVmMigration, PlanAvailableSourceStorages>,
  ) {
    // triggered from useEffect on any data change
    draft.existingResources.sourceStorages = availableSourceStorages;

    draft.calculatedOnce.sourceStorageLabelToId =
      mapSourceStoragesToLabels(availableSourceStorages);

    recalculateStorages(draft);
  },
  [SET_NICK_PROFILES](
    draft,
    { payload: { nicProfiles } }: PageAction<CreateVmMigration, PlanNicProfiles>,
  ) {
    const {
      existingResources,
      calculatedOnce,
      receivedAsParams: { selectedVms },
      alerts,
    } = draft;
    existingResources.nicProfiles = nicProfiles;

    calculatedOnce.networkIdsUsedBySelectedVms = getNetworksUsedBySelectedVms(
      selectedVms,
      nicProfiles,
    );
    if (hasMultipleNicsOnTheSameNetwork(selectedVms, nicProfiles)) {
      addIfMissing(MULTIPLE_NICS_ON_THE_SAME_NETWORK, alerts.networkMappings.warnings);
    }
    recalculateNetworks(draft);
  },
  [SET_DISKS](draft, { payload: { disks } }: PageAction<CreateVmMigration, PlanDisks>) {
    // triggered from useEffect on any data change
    const {
      existingResources,
      calculatedOnce,
      receivedAsParams: { selectedVms },
    } = draft;
    existingResources.disks = disks;

    calculatedOnce.storageIdsUsedBySelectedVms = getStoragesUsedBySelectedVms(selectedVms, disks);
    recalculateStorages(draft);
  },
  [SET_EXISTING_NET_MAPS](
    {
      existingResources,
      underConstruction: { netMap },
      receivedAsParams: { sourceProvider },
      alerts,
    },
    { payload: { existingNetMaps } }: PageAction<CreateVmMigration, PlanExistingNetMaps>,
  ) {
    // triggered from useEffect on any data change
    existingResources.netMaps = existingNetMaps;
    const oldName = netMap.metadata.name;

    netMap.metadata.name = generateUniqueName(
      oldName,
      sourceProvider.metadata.name,
      existingNetMaps,
    );
    if (oldName !== netMap.metadata.name) {
      addIfMissing<NetworkAlerts>(NET_MAP_NAME_REGENERATED, alerts.networkMappings.warnings);
    }
  },
  [SET_EXISTING_STORAGE_MAPS](
    {
      existingResources,
      underConstruction: { storageMap },
      receivedAsParams: { sourceProvider },
      alerts,
    },
    { payload: { existingStorageMaps } }: PageAction<CreateVmMigration, PlanExistingStorageMaps>,
  ) {
    // triggered from useEffect on any data change
    existingResources.storageMaps = existingStorageMaps;
    const oldName = storageMap.metadata.name;

    storageMap.metadata.name = generateUniqueName(
      oldName,
      sourceProvider.metadata.name,
      existingStorageMaps,
    );

    if (oldName !== storageMap.metadata.name) {
      addIfMissing<StorageAlerts>(STORAGE_MAP_NAME_REGENERATED, alerts.storageMappings.warnings);
    }
  },
  [START_CREATE]({
    flow,
    underConstruction: { plan, netMap, storageMap },
    calculatedOnce: { sourceNetworkLabelToId, sourceStorageLabelToId },
    calculatedPerNamespace: { networkMappings, storageMappings },
  }) {
    // triggered by the user
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
    flow.apiError = error;
  },
  [ADD_NETWORK_MAPPING](draft) {
    const { calculatedPerNamespace: cpn } = draft;
    const { sources, mappings } = addMapping(
      cpn.sourceNetworks,
      cpn.targetNetworks,
      cpn.networkMappings,
    );
    // triggered by the user
    if (sources && mappings) {
      cpn.sourceNetworks = sources;
      cpn.networkMappings = mappings;
    }
    executeNetworkMappingValidation(draft);
  },
  [DELETE_NETWORK_MAPPING](draft, { payload: { source } }: PageAction<CreateVmMigration, Mapping>) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const currentSource = cpn.sourceNetworks.find(
      ({ label, isMapped }) => label === source && isMapped,
    );
    if (currentSource) {
      cpn.sourceNetworks = cpn.sourceNetworks.map((m) => ({
        ...m,
        isMapped: m.label === source ? false : m.isMapped,
      }));
      cpn.networkMappings = cpn.networkMappings.filter(
        ({ source }) => source !== currentSource.label,
      );
    }
    executeNetworkMappingValidation(draft);
  },
  [REPLACE_NETWORK_MAPPING](
    draft,
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
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
    executeNetworkMappingValidation(draft);
  },
  [ADD_STORAGE_MAPPING](draft) {
    const { calculatedPerNamespace: cpn } = draft;
    const { sources, mappings } = addMapping(
      cpn.sourceStorages,
      cpn.targetStorages,
      cpn.storageMappings,
    );
    // triggered by the user
    if (sources && mappings) {
      cpn.sourceStorages = sources;
      cpn.storageMappings = mappings;
    }
    executeStorageMappingValidation(draft);
  },
  [DELETE_STORAGE_MAPPING](draft, { payload: { source } }: PageAction<CreateVmMigration, Mapping>) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const { sources, mappings } = deleteMapping(cpn.sourceStorages, source, cpn.storageMappings);

    if (sources && mappings) {
      cpn.sourceStorages = sources;
      cpn.storageMappings = mappings;
    }
    executeStorageMappingValidation(draft);
  },
  [REPLACE_STORAGE_MAPPING](
    draft,
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
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
    executeStorageMappingValidation(draft);
  },
  [REMOVE_ALERT](
    { alerts: { networkMappings, storageMappings } },
    { payload: { alertKey } }: PageAction<CreateVmMigration, PlanAlert>,
  ) {
    [
      networkMappings.errors,
      networkMappings.warnings,
      storageMappings.errors,
      storageMappings.warnings,
    ].forEach((alerts) => {
      const index = alerts.findIndex((key) => key === alertKey);
      if (index > -1) {
        alerts.splice(index, 1);
      }
    });
  },
};

const actionsAllowedAfterEditingIsDone: CreateVmMigration[] = [SET_API_ERROR];

// action with data required on page start
// skip SET_EXISTING_* actions as they only add extra validation
const actionsTrackedForInitialLoading: CreateVmMigration[] = [
  SET_AVAILABLE_PROVIDERS,
  SET_AVAILABLE_SOURCE_NETWORKS,
  SET_AVAILABLE_SOURCE_STORAGES,
  SET_AVAILABLE_TARGET_NAMESPACES,
  SET_AVAILABLE_TARGET_NETWORKS,
  SET_AVAILABLE_TARGET_STORAGES,
  SET_DISKS,
  SET_NICK_PROFILES,
];

export const reducer = (
  draft: Draft<CreateVmMigrationPageState>,
  action: PageAction<CreateVmMigration, unknown>,
) => {
  console.warn(`reducer: ${action?.type}`, action?.payload);
  if (
    actionsTrackedForInitialLoading.includes(action?.type) &&
    !draft.flow.initialLoading[action.type]
  ) {
    draft.flow.initialLoading[action.type] = true;
  }
  return draft.flow.editingDone && !actionsAllowedAfterEditingIsDone.includes[action?.type]
    ? draft
    : handlers?.[action?.type]?.(draft, action) ?? draft;
};
