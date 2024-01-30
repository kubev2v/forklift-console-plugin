import { FC } from 'react';
import { Draft } from 'immer';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import { ResourceFieldFactory, RowProps } from '@kubev2v/common';
import {
  OpenShiftNamespace,
  OpenshiftResource,
  OVirtNicProfile,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';

import { InventoryNetwork } from '../../hooks/useNetworks';
import { getIsTarget, Validation } from '../../utils';
import { VmData } from '../details';

import {
  ADD_NETWORK_MAPPING,
  CreateVmMigration,
  DEFAULT_NAMESPACE,
  DELETE_NETWORK_MAPPING,
  PageAction,
  PlanAvailableProviders,
  PlanAvailableSourceNetworks,
  PlanAvailableTargetNamespaces,
  PlanAvailableTargetNetworks,
  PlanError,
  PlanExistingNetMaps,
  PlanExistingPlans,
  PlanMapping,
  PlanName,
  PlanNickProfiles,
  PlanTargetNamespace,
  PlanTargetProvider,
  POD_NETWORK,
  REPLACE_NETWORK_MAPPING,
  SET_AVAILABLE_PROVIDERS,
  SET_AVAILABLE_SOURCE_NETWORKS,
  SET_AVAILABLE_TARGET_NAMESPACES,
  SET_AVAILABLE_TARGET_NETWORKS,
  SET_ERROR,
  SET_EXISTING_NET_MAPS,
  SET_EXISTING_PLANS,
  SET_NAME,
  SET_NICK_PROFILES,
  SET_TARGET_NAMESPACE,
  SET_TARGET_PROVIDER,
  START_CREATE,
} from './actions';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { Mapping } from './MappingList';
import {
  calculateNetworks,
  generateName,
  mapSourceNetworksToLabels,
  setTargetNamespace,
  setTargetProvider,
  validatePlanName,
  validateTargetNamespace,
  validateUniqueName,
} from './stateHelpers';

export interface CreateVmMigrationPageState {
  underConstruction: {
    plan: V1beta1Plan;
    netMap: V1beta1NetworkMap;
    storageMap: V1beta1StorageMap;
  };

  validation: {
    planName: Validation;
    targetNamespace: Validation;
    targetProvider: Validation;
  };
  // data fetched from k8s or inventory
  existingResources: {
    providers: V1beta1Provider[];
    plans: V1beta1Plan[];
    targetNamespaces: OpenShiftNamespace[];
    targetNetworks: OpenshiftResource[];
    sourceNetworks: InventoryNetwork[];
    targetStorages: unknown[];
    nickProfiles: OVirtNicProfile[];
    netMaps: V1beta1NetworkMap[];
    createdNetMap?: V1beta1NetworkMap;
    createdStorageMap?: V1beta1StorageMap;
    createdPlan?: V1beta1Plan;
  };
  calculatedOnce: {
    // calculated on start (exception:for ovirt/openstack we need to fetch disks)
    storagesUsedBySelectedVms: string[];
    // calculated on start (exception:for ovirt we need to fetch nic profiles)
    networkIdsUsedBySelectedVms: string[];
    sourceNetworkLabelToId: { [label: string]: string };
    // calculated on start
    vmFieldsFactory: [ResourceFieldFactory, FC<RowProps<VmData>>];
  };
  // re-calculated on every target namespace change
  calculatedPerNamespace: {
    // read-only
    targetStorages: string[];
    // read-only, human-readable
    targetNetworks: string[];
    targetNetworkLabelToId: { [label: string]: string };
    sourceNetworks: {
      // read-only
      label: string;
      usedBySelectedVms: boolean;
      // mutated via UI
      isMapped: boolean;
    }[];
    sourceStorages: string[];
    // mutated, both source and destination human-readable
    networkMappings: Mapping[];
    storageMappings: Mapping[];
  };
  receivedAsParams: {
    selectedVms: VmData[];
    sourceProvider: V1beta1Provider;
    namespace: string;
  };
  // placeholder for helper data
  workArea: {
    targetProvider: V1beta1Provider;
  };
  flow: {
    editingDone: boolean;
    validationError: Error | null;
    apiError?: Error;
  };
}

const actions: {
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
      payload: { availableProviders, loading, error },
    }: PageAction<CreateVmMigration, PlanAvailableProviders>,
  ) {
    if (loading || error || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_PROVIDERS, availableProviders);
    draft.existingResources.providers = availableProviders;
    if (
      !availableProviders
        .filter(getIsTarget)
        .find(
          (p) => p?.metadata?.name === draft.underConstruction.plan.spec.provider.destination?.name,
        )
    ) {
      // the current provider is missing in the list of available providers
      // possible cases:
      // 1. no provider set (yet)
      // 2. provider got removed in the meantime
      // 3. no host provider in the namespace
      const firstHostProvider = availableProviders.find((p) => isProviderLocalOpenshift(p));
      setTargetProvider(draft, firstHostProvider?.metadata?.name, availableProviders);
    }
    return draft;
  },
  [SET_EXISTING_PLANS](
    draft,
    {
      payload: { existingPlans, loading, error },
    }: PageAction<CreateVmMigration, PlanExistingPlans>,
  ) {
    if (loading || error || draft.flow.editingDone) {
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
      payload: { availableTargetNamespaces, loading, error },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNamespaces>,
  ) {
    const {
      existingResources,
      validation,
      underConstruction: { plan },
      workArea: { targetProvider },
      flow: { editingDone },
    } = draft;
    if (loading || error || editingDone) {
      return;
    }
    console.warn(SET_AVAILABLE_TARGET_NAMESPACES, availableTargetNamespaces);
    existingResources.targetNamespaces = availableTargetNamespaces;

    validation.targetNamespace = validateTargetNamespace(
      plan.spec.targetNamespace,
      availableTargetNamespaces,
    );
    if (validation.targetNamespace === 'success') {
      return draft;
    }

    const targetNamespace =
      // use the current namespace (inherited from source provider)
      (isProviderLocalOpenshift(targetProvider) && plan.metadata.namespace) ||
      // use 'default' if exists
      (availableTargetNamespaces.find((n) => n.name === DEFAULT_NAMESPACE) && DEFAULT_NAMESPACE) ||
      // use the first from the list (if exists)
      availableTargetNamespaces[0]?.name;

    setTargetNamespace(draft, targetNamespace);
    return draft;
  },
  [SET_AVAILABLE_TARGET_NETWORKS](
    draft,
    {
      payload: { availableTargetNetworks, loading, error },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNetworks>,
  ) {
    if (loading || error || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_TARGET_NETWORKS, availableTargetNetworks);
    draft.existingResources.targetNetworks = availableTargetNetworks;

    draft.calculatedPerNamespace = {
      ...draft.calculatedPerNamespace,
      ...calculateNetworks(draft),
    };
    return draft;
  },
  [SET_AVAILABLE_SOURCE_NETWORKS](
    draft,
    {
      payload: { availableSourceNetworks, loading, error },
    }: PageAction<CreateVmMigration, PlanAvailableSourceNetworks>,
  ) {
    if (loading || error || draft.flow.editingDone) {
      return draft;
    }
    console.warn(SET_AVAILABLE_SOURCE_NETWORKS, availableSourceNetworks);
    draft.existingResources.sourceNetworks = availableSourceNetworks;
    draft.calculatedOnce.sourceNetworkLabelToId =
      mapSourceNetworksToLabels(availableSourceNetworks);
    draft.calculatedPerNamespace = {
      ...draft.calculatedPerNamespace,
      ...calculateNetworks(draft),
    };
    return draft;
  },
  [SET_NICK_PROFILES](
    draft,
    { payload: { nickProfiles, loading, error } }: PageAction<CreateVmMigration, PlanNickProfiles>,
  ) {
    const {
      existingResources,
      calculatedOnce,
      receivedAsParams: { selectedVms },
      flow: { editingDone },
    } = draft;
    if (loading || error || editingDone) {
      return;
    }
    console.warn(SET_NICK_PROFILES, nickProfiles);
    existingResources.nickProfiles = nickProfiles;
    calculatedOnce.networkIdsUsedBySelectedVms = getNetworksUsedBySelectedVms(
      selectedVms,
      nickProfiles,
    );
    draft.calculatedPerNamespace = {
      ...draft.calculatedPerNamespace,
      ...calculateNetworks(draft),
    };
  },
  [SET_EXISTING_NET_MAPS](
    {
      existingResources,
      underConstruction: { netMap },
      receivedAsParams: { sourceProvider },
      flow: { editingDone },
    },
    {
      payload: { existingNetMaps, loading, error },
    }: PageAction<CreateVmMigration, PlanExistingNetMaps>,
  ) {
    if (loading || error || editingDone) {
      return;
    }
    console.warn(SET_EXISTING_NET_MAPS, existingNetMaps);
    existingResources.netMaps = existingNetMaps;
    const names = existingNetMaps.map((n) => n.metadata?.name).filter(Boolean);
    while (!validateUniqueName(netMap.metadata.name, names)) {
      netMap.metadata.name = generateName(sourceProvider.metadata.name);
    }
  },
  [START_CREATE]({
    flow,
    underConstruction: { plan, netMap, storageMap },
    calculatedOnce: { sourceNetworkLabelToId },
    calculatedPerNamespace: { networkMappings },
  }) {
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
    storageMap.spec.map = [];
  },
  [SET_ERROR]({ flow }, { payload: { error } }: PageAction<CreateVmMigration, PlanError>) {
    console.warn(SET_ERROR);
    flow.apiError = error;
  },
  [ADD_NETWORK_MAPPING]({ calculatedPerNamespace: cpn }) {
    const firstUsedByVms = cpn.sourceNetworks.find(
      ({ usedBySelectedVms, isMapped }) => usedBySelectedVms && !isMapped,
    );
    const firstGeneral = cpn.sourceNetworks.find(
      ({ usedBySelectedVms, isMapped }) => !usedBySelectedVms && !isMapped,
    );
    const nextSource = firstUsedByVms || firstGeneral;
    const nextDest = cpn.targetNetworks[0];

    console.warn(ADD_NETWORK_MAPPING, nextSource, nextDest);
    if (nextDest && nextSource) {
      cpn.sourceNetworks = cpn.sourceNetworks.map((m) => ({
        ...m,
        isMapped: m.label === nextSource.label ? true : m.isMapped,
      }));
      cpn.networkMappings = [
        ...cpn.networkMappings,
        { source: nextSource.label, destination: cpn.targetNetworks[0] },
      ];
    }
  },
  [DELETE_NETWORK_MAPPING](
    { calculatedPerNamespace: cpn },
    { payload: { source } }: PageAction<CreateVmMigration, Mapping>,
  ) {
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
    console.warn(REPLACE_NETWORK_MAPPING, current, next);
    const currentSource = cpn.sourceNetworks.find(
      ({ label, isMapped }) => label === current.source && isMapped,
    );
    const nextSource = cpn.sourceNetworks.find(({ label }) => label === next.source);
    const nextDest = cpn.targetNetworks.find((label) => label === next.destination);
    const sourceChanged = currentSource.label !== nextSource.label;
    const destinationChanged = current.destination !== nextDest;

    if (!currentSource || !nextSource || !nextDest || (!sourceChanged && !destinationChanged)) {
      return;
    }

    if (sourceChanged) {
      const labelToMappingState = { [currentSource.label]: false, [nextSource.label]: true };
      cpn.sourceNetworks = cpn.sourceNetworks.map((m) => ({
        ...m,
        isMapped: labelToMappingState[m.label] ?? m.isMapped,
      }));
    }

    const mappingIndex = cpn.networkMappings.findIndex(({ source }) => source === current.source);
    mappingIndex > -1 && cpn.networkMappings.splice(mappingIndex, 1, next);
  },
};

export const reducer = (
  draft: Draft<CreateVmMigrationPageState>,
  action: PageAction<CreateVmMigration, unknown>,
) => {
  return actions?.[action?.type]?.(draft, action) ?? draft;
};
