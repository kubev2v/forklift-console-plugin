import type { Draft } from 'immer';
import { getIsTarget } from 'src/modules/Providers/utils/helpers/getIsTarget';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import type { ProviderType } from '@kubev2v/types';

import { toId } from '../../details/tabs/VirtualMachines/components/ProviderVirtualMachinesList';
import {
  type CreateVmMigrationPageState,
  type Mapping,
  MULTIPLE_NICS_ON_THE_SAME_NETWORK,
  OVIRT_NICS_WITH_EMPTY_PROFILE,
} from '../types';

import {
  ADD_NETWORK_MAPPING,
  ADD_STORAGE_MAPPING,
  type CreateVmMigration,
  DEFAULT_NAMESPACE,
  DELETE_NETWORK_MAPPING,
  DELETE_STORAGE_MAPPING,
  INIT,
  type PageAction,
  type PlanAlert,
  type PlanAvailableProviders,
  type PlanAvailableSourceNetworks,
  type PlanAvailableSourceStorages,
  type PlanAvailableTargetNamespaces,
  type PlanAvailableTargetNetworks,
  type PlanAvailableTargetStorages,
  type PlanDisks,
  type PlanError,
  type PlanExistingNetMaps,
  type PlanExistingPlans,
  type PlanExistingStorageMaps,
  type PlanMapping,
  type PlanName,
  type PlanNicProfiles,
  type PlanTargetNamespace,
  type PlanTargetProvider,
  POD_NETWORK,
  type ProjectName,
  REMOVE_ALERT,
  REPLACE_NETWORK_MAPPING,
  REPLACE_STORAGE_MAPPING,
  type SelectedVms,
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
  SET_PROJECT_NAME,
  SET_SELECTED_VMS,
  SET_SOURCE_PROVIDER,
  SET_TARGET_NAMESPACE,
  SET_TARGET_PROVIDER,
  type SourceProvider,
  START_CREATE,
} from './actions';
import { addMapping, deleteMapping, replaceMapping } from './changeMapping';
import { createInitialState, type InitialStateParameters } from './createInitialState';
import { getNamespacesUsedBySelectedVms } from './getNamespacesUsedBySelectedVms';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
import { hasMultipleNicsOnTheSameNetwork } from './hasMultipleNicsOnTheSameNetwork';
import { hasNicWithEmptyProfile } from './hasNicWithEmptyProfile';
import {
  addIfMissing,
  alreadyInUseBySelectedVms,
  executeNetworkMappingValidation,
  executeStorageMappingValidation,
  getObjectRef,
  recalculateNetworks,
  recalculateStorages,
  resourceFieldsForType,
  reTestNetworks,
  reTestStorages,
  setTargetNamespace,
  setTargetProvider,
  validatePlanName,
  validateTargetNamespace,
} from './helpers';
import { mapSourceNetworksToLabels, mapSourceStoragesToLabels } from './mapSourceToLabels';

const handlers: Record<
  string,
  (
    draft: Draft<CreateVmMigrationPageState>,
    action: PageAction<CreateVmMigration, unknown>,
  ) => CreateVmMigrationPageState
> = {
  [ADD_NETWORK_MAPPING](draft) {
    const { calculatedPerNamespace: cpn } = draft;
    const { mappings, sources } = addMapping(
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

    reTestNetworks(draft);
  },
  [ADD_STORAGE_MAPPING](draft) {
    const { calculatedPerNamespace: cpn } = draft;
    const { mappings, sources } = addMapping(
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

    reTestStorages(draft);
  },
  [DELETE_NETWORK_MAPPING](draft, { payload: { source } }: PageAction<CreateVmMigration, Mapping>) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const currentSource = cpn.sourceNetworks.find(
      ({ isMapped, label }) => label === source && isMapped,
    );
    if (currentSource) {
      cpn.sourceNetworks = cpn.sourceNetworks.map((sourceNetwork) => ({
        ...sourceNetwork,
        isMapped: sourceNetwork.label === source ? false : sourceNetwork.isMapped,
      }));
      cpn.networkMappings = cpn.networkMappings.filter(
        ({ source }) => source !== currentSource.label,
      );
    }
    executeNetworkMappingValidation(draft);

    reTestNetworks(draft);
  },
  [DELETE_STORAGE_MAPPING](draft, { payload: { source } }: PageAction<CreateVmMigration, Mapping>) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const { mappings, sources } = deleteMapping(cpn.sourceStorages, source, cpn.storageMappings);

    if (sources && mappings) {
      cpn.sourceStorages = sources;
      cpn.storageMappings = mappings;
    }
    executeStorageMappingValidation(draft);

    reTestStorages(draft);
  },
  [INIT](
    draft,
    {
      payload: { namespace, planName, projectName, selectedVms, sourceProvider },
    }: PageAction<CreateVmMigration, InitialStateParameters>,
  ) {
    const newDraft = createInitialState({
      namespace,
      planName,
      projectName,
      selectedVms,
      sourceProvider,
    });

    draft.underConstruction = newDraft.underConstruction;
    draft.calculatedOnce = newDraft.calculatedOnce;
    draft.calculatedPerNamespace = newDraft.calculatedPerNamespace;
    draft.receivedAsParams = newDraft.receivedAsParams;
    draft.alerts = newDraft.alerts;
    draft.validation = newDraft.validation;
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
  [REPLACE_NETWORK_MAPPING](
    draft,
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const { mappings, sources } = replaceMapping(
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

    reTestNetworks(draft);
  },
  [REPLACE_STORAGE_MAPPING](
    draft,
    { payload: { current, next } }: PageAction<CreateVmMigration, PlanMapping>,
  ) {
    const { calculatedPerNamespace: cpn } = draft;
    // triggered by the user
    const { mappings, sources } = replaceMapping(
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

    reTestStorages(draft);
  },
  [SET_API_ERROR]({ flow }, { payload: { error } }: PageAction<CreateVmMigration, PlanError>) {
    // triggered by the API callback (on failure)
    flow.apiError = error;
    flow.editingDone = false;
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
      .find((provider) => provider?.metadata?.name === plan?.spec?.provider.destination?.name);
    if (!resolvedDestination && !oldTarget) {
      // case: no provider set (yet)
      // it's possible that there is no host provider in the namespace (empty will trigger error)
      const firstHostProvider = availableProviders.find((provider) =>
        isProviderLocalOpenshift(provider),
      );
      setTargetProvider(draft, firstHostProvider?.metadata?.name, availableProviders);
    } else if (!resolvedDestination) {
      // case: provider got removed in the meantime
      // notify the user by setting an empty provider (will trigger error)
      setTargetProvider(draft, undefined, availableProviders);
    }
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
  [SET_AVAILABLE_TARGET_NAMESPACES](
    draft,
    {
      payload: { availableTargetNamespaces },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNamespaces>,
  ) {
    // triggered from useEffect on any data change
    const {
      calculatedOnce: { namespacesUsedBySelectedVms },
      existingResources,
      flow: { editingDone },
      receivedAsParams: { sourceProvider },
      underConstruction: { plan },
      validation,
      workArea: { targetProvider },
    } = draft;
    if (editingDone) {
      return;
    }
    existingResources.targetNamespaces = availableTargetNamespaces;

    const alreadyInUse = (namespace: string) =>
      alreadyInUseBySelectedVms({
        namespace,
        namespacesUsedBySelectedVms,
        sourceProvider,
        targetProvider,
      });

    validation.targetNamespace = validateTargetNamespace(
      plan.spec.targetNamespace,
      alreadyInUse(plan.spec.targetNamespace),
    );
    if (validation.targetNamespace === 'success') {
      return draft;
    }

    const targetNamespace =
      // use the selected project name
      (draft.underConstruction?.projectName ||
        (availableTargetNamespaces.find(
          (namespace) => namespace.name === DEFAULT_NAMESPACE && !alreadyInUse(DEFAULT_NAMESPACE),
        ) &&
          DEFAULT_NAMESPACE)) ??
      // use the first from the list (if exists)
      availableTargetNamespaces.find((namespace) => !alreadyInUse(namespace.name))?.name;

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
  [SET_DISKS](draft, { payload: { disks } }: PageAction<CreateVmMigration, PlanDisks>) {
    // triggered from useEffect on any data change
    const {
      calculatedOnce,
      existingResources,
      receivedAsParams: { selectedVms },
    } = draft;
    existingResources.disks = disks;

    calculatedOnce.storageIdsUsedBySelectedVms = getStoragesUsedBySelectedVms(
      draft.calculatedOnce.sourceStorageLabelToId,
      selectedVms,
      disks,
    );
    recalculateStorages(draft);
  },
  [SET_EXISTING_NET_MAPS](
    { existingResources },
    { payload: { existingNetMaps } }: PageAction<CreateVmMigration, PlanExistingNetMaps>,
  ) {
    // triggered from useEffect on any data change
    existingResources.netMaps = existingNetMaps;
  },
  [SET_EXISTING_PLANS](
    draft,
    { payload: { existingPlans } }: PageAction<CreateVmMigration, PlanExistingPlans>,
  ) {
    // triggered from useEffect on any data change
    draft.existingResources.plans = existingPlans;
  },
  [SET_EXISTING_STORAGE_MAPS](
    { existingResources },
    { payload: { existingStorageMaps } }: PageAction<CreateVmMigration, PlanExistingStorageMaps>,
  ) {
    // triggered from useEffect on any data change
    existingResources.storageMaps = existingStorageMaps;
  },
  [SET_NAME](draft, { payload: { name } }: PageAction<CreateVmMigration, PlanName>) {
    draft.underConstruction.plan.metadata.name = name;
    draft.validation.planName = validatePlanName(name, draft.existingResources.plans);
  },
  [SET_NICK_PROFILES](
    draft,
    { payload: { nicProfiles } }: PageAction<CreateVmMigration, PlanNicProfiles>,
  ) {
    const {
      alerts,
      calculatedOnce,
      existingResources,
      receivedAsParams: { selectedVms },
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
  [SET_PROJECT_NAME](draft, { payload: { name } }: PageAction<CreateVmMigration, ProjectName>) {
    draft.underConstruction.projectName = name;
    draft.validation.projectName = name ? 'success' : 'error';
  },
  [SET_SELECTED_VMS](
    draft,
    { payload: { sourceProvider, vms } }: PageAction<CreateVmMigration, SelectedVms>,
  ) {
    const hasVmNicWithEmptyProfile = hasNicWithEmptyProfile(sourceProvider, vms);

    draft.underConstruction.plan.spec.vms = vms.map((data) => ({
      id: toId(data),
      name: data.name,
      namespace: data.namespace,
    }));

    draft.receivedAsParams.selectedVms = vms;
    draft.validation.networkMappings = hasVmNicWithEmptyProfile ? 'error' : 'default';
    draft.alerts.networkMappings = {
      errors: hasVmNicWithEmptyProfile ? [OVIRT_NICS_WITH_EMPTY_PROFILE] : [],
      warnings: hasMultipleNicsOnTheSameNetwork(vms) ? [MULTIPLE_NICS_ON_THE_SAME_NETWORK] : [],
    };

    draft.calculatedOnce = {
      ...draft.calculatedOnce,
      namespacesUsedBySelectedVms:
        sourceProvider.spec?.type === 'openshift' ? getNamespacesUsedBySelectedVms(vms) : [],
      networkIdsUsedBySelectedVms:
        sourceProvider.spec?.type !== 'ovirt' ? getNetworksUsedBySelectedVms(vms, []) : [],
      storageIdsUsedBySelectedVms: ['ovirt', 'openstack'].includes(sourceProvider.spec?.type)
        ? []
        : getStoragesUsedBySelectedVms({}, vms, []),
    };
  },
  [SET_SOURCE_PROVIDER](
    draft,
    { payload: { sourceProvider } }: PageAction<CreateVmMigration, SourceProvider>,
  ) {
    const sourceProviderRef = getObjectRef(sourceProvider);
    const sourceProviderGenName = `${sourceProvider.metadata.name}-`;

    draft.underConstruction.plan.spec.provider.source = sourceProviderRef;
    draft.underConstruction.netMap.spec.provider.source = sourceProviderRef;
    draft.underConstruction.storageMap.spec.provider.source = sourceProviderRef;

    draft.underConstruction.netMap.metadata.generateName = sourceProviderGenName;
    draft.underConstruction.storageMap.metadata.generateName = sourceProviderGenName;

    draft.receivedAsParams.sourceProvider = sourceProvider;
    draft.calculatedOnce.vmFieldsFactory = resourceFieldsForType(
      sourceProvider?.spec?.type as ProviderType,
    );
    draft.flow.initialLoading = {
      [SET_DISKS]: !['ovirt', 'openstack'].includes(sourceProvider.spec?.type),
      [SET_NICK_PROFILES]: sourceProvider.spec?.type !== 'ovirt',
    };
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
      existingResources,
      underConstruction: { plan },
    } = draft;
    // avoid side effects if no real change
    if (plan.spec.provider?.destination?.name !== targetProviderName) {
      setTargetProvider(draft, targetProviderName, existingResources.providers);
    }
  },
  [START_CREATE]({
    calculatedOnce: { sourceNetworkLabelToId, sourceStorageLabelToId },
    calculatedPerNamespace: { networkMappings, storageMappings },
    flow,
    receivedAsParams: { sourceProvider },
    underConstruction: { netMap, plan, projectName, storageMap },
  }) {
    // triggered by the user
    flow.editingDone = true;

    netMap.metadata.namespace = projectName;
    storageMap.metadata.namespace = projectName;
    plan.metadata.namespace = projectName;

    netMap.spec.map = networkMappings.map(({ destination, source }) => ({
      destination:
        destination === POD_NETWORK
          ? { type: 'pod' }
          : { name: destination, namespace: plan.spec.targetNamespace, type: 'multus' },
      source:
        sourceNetworkLabelToId[source] === 'pod'
          ? { type: 'pod' }
          : {
              id: sourceNetworkLabelToId[source],
              name: sourceProvider?.spec?.type === 'openshift' ? source : undefined,
              type: sourceProvider?.spec?.type === 'openshift' ? 'multus' : undefined,
            },
    }));

    storageMap.spec.map = storageMappings.map(({ destination, source }) => {
      if (sourceProvider?.spec?.type === 'openshift') {
        return {
          destination: { storageClass: destination },
          source: {
            id: sourceStorageLabelToId[source],
            name: source.replace(/^\//gu, ''),
          },
        };
      }

      if (source === 'glance') {
        return {
          destination: { storageClass: destination },
          source: {
            name: 'glance',
          },
        };
      }

      return {
        destination: { storageClass: destination },
        source: {
          id: sourceStorageLabelToId[source],
        },
      };
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
  return draft.flow.editingDone && !actionsAllowedAfterEditingIsDone.includes(action?.type)
    ? draft
    : (handlers?.[action?.type]?.(draft, action) ?? draft);
};
