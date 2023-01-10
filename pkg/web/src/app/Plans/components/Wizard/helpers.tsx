import * as React from 'react';
import { Tooltip, TreeViewDataItem } from '@patternfly/react-core';
import {
  ICommonTreeObject,
  IHook,
  INameNamespaceRef,
  INetworkMapping,
  IPlan,
  SourceVM,
  IStorageMapping,
  IInventoryHostTree,
  ISourceVMConcern,
  IVMwareFolderTree,
  MappingSource,
  MappingType,
  InventoryTree,
  InventoryTreeType,
  IVMwareVM,
  IRHVVM,
} from '@app/queries/types';
import EnterpriseIcon from '@patternfly/react-icons/dist/esm/icons/enterprise-icon';
import ClusterIcon from '@patternfly/react-icons/dist/esm/icons/cluster-icon';
import FolderIcon from '@patternfly/react-icons/dist/esm/icons/folder-icon';
import OutlinedHddIcon from '@patternfly/react-icons/dist/esm/icons/outlined-hdd-icon';
import {
  getBuilderItemsFromMappingItems,
  getBuilderItemsWithMissingSources,
  getMappingFromBuilderItems,
} from '@app/Mappings/components/MappingBuilder/helpers';
import { PlanWizardFormState, PlanWizardMode } from './PlanWizard';
import { CLUSTER_API_VERSION, ProviderType } from '@app/common/constants';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  isSameResource,
  nameAndNamespace,
} from '@app/queries/helpers';
import {
  findProvidersByRefs,
  useMappingResourceQueries,
  useInventoryProvidersQuery,
  useInventoryTreeQuery,
  useMappingsQuery,
  useHooksQuery,
  useSourceVMsQuery,
  IndexedTree,
  IndexedSourceVMs,
  usePlansQuery,
  useNicProfilesQuery,
  useDisksQuery,
  INicProfile,
  IDisk,
} from '@app/queries';
import { UseQueryResult, QueryStatus } from 'react-query';
import { StatusType } from '@migtools/lib-ui';
import { PlanHookInstance } from './PlanAddEditHookModal';
import { IKubeList } from '@app/client/types';
import { getObjectRef } from '@app/common/helpers';

// Exclude VMs and Hosts from the rendered tree entirely
export const isIncludedNode = (node: InventoryTree): boolean =>
  node.kind !== 'VM' && node.kind !== 'Host';
export const isIncludedLeafNode = (node: InventoryTree): boolean =>
  isIncludedNode(node) &&
  (!node.children ||
    node.children.length === 0 ||
    node.children.every((child) => !isIncludedNode(child)));

// Helper for filterAndConvertInventoryTree
const subtreeMatchesSearch = (
  node: InventoryTree,
  searchText: string,
  indexedTree: IndexedTree
) => {
  if (!isIncludedNode(node)) return false;
  if (searchText === '') return true;
  const descendants = indexedTree.getDescendants(node, true);
  return descendants.some((descendant) =>
    (descendant.object?.name || '').toLowerCase().includes(searchText.toLowerCase())
  );
};

export const useIsNodeSelectableCallback = (
  treeType: InventoryTreeType
): ((node: InventoryTree) => boolean) =>
  React.useCallback(
    (node: InventoryTree) => {
      if (isIncludedLeafNode(node)) return true;
      if (treeType === InventoryTreeType.VM) {
        return node.kind === 'Folder' || node.kind.toLowerCase() === 'datacenter';
      }
      return false;
    },
    [treeType]
  );

const areSomeDescendantsSelected = (
  indexedTree: IndexedTree,
  node: InventoryTree,
  isNodeSelected: (node: InventoryTree) => boolean
) => {
  if (isNodeSelected(node)) return true;
  return indexedTree.getDescendants(node).some(isNodeSelected);
};

const areAllSelectableDescendantsSelected = (
  indexedTree: IndexedTree,
  node: InventoryTree,
  isNodeSelected: (node: InventoryTree) => boolean,
  isNodeSelectable: (node: InventoryTree) => boolean
) => {
  if (!node.children) return isNodeSelected(node);
  return indexedTree.getDescendants(node).filter(isNodeSelectable).every(isNodeSelected);
};

export const isNodeFullyChecked = (
  indexedTree: IndexedTree,
  node: InventoryTree | null,
  isNodeSelected: (node: InventoryTree) => boolean,
  isNodeSelectable: (node: InventoryTree) => boolean
): boolean => {
  if (!node) return false;
  return (
    isNodeSelected(node) ||
    areAllSelectableDescendantsSelected(indexedTree, node, isNodeSelected, isNodeSelectable)
  );
};

export const isNodePartiallyChecked = (
  indexedTree: IndexedTree,
  node: InventoryTree | null,
  isNodeSelected: (node: InventoryTree) => boolean,
  isFullyChecked: boolean
): boolean => {
  if (!node) return false;
  return !isFullyChecked && areSomeDescendantsSelected(indexedTree, node, isNodeSelected);
};

// Helper for filterAndConvertInventoryTree
const convertInventoryTreeNode = (
  indexedTree: IndexedTree,
  node: InventoryTree,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean,
  isNodeSelectable: (node: InventoryTree) => boolean,
  getNodeBadgeContent: (node: InventoryTree, isRootNode: boolean) => React.ReactNode
): TreeViewDataItem => {
  const isFullyChecked = isNodeFullyChecked(indexedTree, node, isNodeSelected, isNodeSelectable);
  const isPartiallyChecked = isNodePartiallyChecked(
    indexedTree,
    node,
    isNodeSelected,
    isFullyChecked
  );
  const badge = getNodeBadgeContent(node, false);
  return {
    name: node.object?.name || '',
    id: node.object?.selfLink,
    children: filterAndConvertInventoryTreeChildren(
      indexedTree,
      node.children,
      searchText,
      isNodeSelected,
      isNodeSelectable,
      getNodeBadgeContent
    ),
    checkProps: {
      'aria-label': `Select ${node.kind} ${node.object?.name || ''}`,
      checked: isPartiallyChecked ? null : isFullyChecked,
    },
    icon:
      node.kind === 'DataCenter' || node.kind === 'Datacenter' ? (
        <Tooltip content="Datacenter">
          <EnterpriseIcon />
        </Tooltip>
      ) : node.kind === 'Cluster' ? (
        node.object?.variant === 'ComputeResource' ? (
          <Tooltip content="Standalone host">
            <OutlinedHddIcon />
          </Tooltip>
        ) : (
          <Tooltip content="Cluster">
            <ClusterIcon />
          </Tooltip>
        )
      ) : node.kind === 'Folder' ? (
        <Tooltip content="Folder">
          <FolderIcon />
        </Tooltip>
      ) : null,
    customBadgeContent: badge,
    hasBadge: !!badge,
    defaultExpanded: false,
  };
};

// Helper for filterAndConvertInventoryTree
const filterAndConvertInventoryTreeChildren = (
  indexedTree: IndexedTree,
  children: InventoryTree[] | null,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean,
  isNodeSelectable: (node: InventoryTree) => boolean,
  getNodeBadgeContent: (node: InventoryTree, isRootNode: boolean) => React.ReactNode
): TreeViewDataItem[] | undefined => {
  const filteredChildren = ((children || []) as InventoryTree[]).filter((node) =>
    subtreeMatchesSearch(node, searchText, indexedTree)
  );
  if (filteredChildren.length > 0)
    return filteredChildren.map((node) =>
      convertInventoryTreeNode(
        indexedTree,
        node,
        searchText,
        isNodeSelected,
        isNodeSelectable,
        getNodeBadgeContent
      )
    );
  return undefined;
};

// Convert the API tree structure to the PF TreeView structure, while filtering by the user's search text.
export const filterAndConvertInventoryTree = (
  indexedTree: IndexedTree | null,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean,
  areAllSelected: boolean,
  isNodeSelectable: (node: InventoryTree) => boolean,
  getNodeBadgeContent: (node: InventoryTree, isRootNode: boolean) => React.ReactNode
): TreeViewDataItem[] => {
  if (!indexedTree?.tree) return [];
  const rootNode = indexedTree.tree;
  const isPartiallyChecked = isNodePartiallyChecked(
    indexedTree,
    rootNode,
    isNodeSelected,
    areAllSelected
  );
  const badge = getNodeBadgeContent(rootNode, true);
  return [
    {
      name: 'All datacenters',
      id: 'converted-root',
      checkProps: {
        'aria-label': 'Select all datacenters',
        checked: isPartiallyChecked ? null : areAllSelected,
      },
      children: filterAndConvertInventoryTreeChildren(
        indexedTree,
        rootNode.children,
        searchText,
        isNodeSelected,
        isNodeSelectable,
        getNodeBadgeContent
      ),
      customBadgeContent: badge,
      hasBadge: !!badge,
      defaultExpanded: true,
    },
  ];
};

// From the flattened selected nodes list, get all the unique VMs.
const getAllVMChildren = (
  indexedTree: IndexedTree,
  nodes: InventoryTree[],
  treeType: InventoryTreeType
): InventoryTree[] => {
  if (nodes.length === 0) return [];
  return Array.from(
    new Set(
      nodes.flatMap((node) => {
        // Only include direct children of nodes in the folder tree so we can exclude subfolders
        if (
          node.kind === 'Folder' ||
          (treeType === InventoryTreeType.VM && node.kind.toLowerCase() === 'datacenter')
        ) {
          return node.children?.filter((child) => child.kind === 'VM') || [];
        }
        // Otherwise, we might have VMs under hidden descendants like hosts
        return (node.object && indexedTree.vmDescendantsBySelfLink[node.object.selfLink]) || [];
      })
    )
  );
};

export const getAvailableVMs = (
  indexedTree: IndexedTree | undefined,
  selectedTreeNodes: InventoryTree[],
  indexedVMs: IndexedSourceVMs | undefined,
  treeType: InventoryTreeType,
  includeExtraVMs: SourceVM[] = []
): SourceVM[] => {
  if (!indexedTree) return [];
  const treeVMNodes = getAllVMChildren(indexedTree, selectedTreeNodes, treeType);
  const vmSelfLinks = [
    ...includeExtraVMs.map((vm) => vm.selfLink),
    ...treeVMNodes
      .flatMap(({ object }) => (object ? [object.selfLink] : []))
      .filter((selfLink) => !includeExtraVMs.some((extraVM) => selfLink === extraVM.selfLink)),
  ];
  const matchingVMs = indexedVMs?.findVMsBySelfLinks(vmSelfLinks) || [];
  return matchingVMs;
};

export interface IVMTreePathInfo {
  datacenter: ICommonTreeObject | null;
  cluster: ICommonTreeObject | null;
  host: ICommonTreeObject | null;
  folders: ICommonTreeObject[] | null;
  folderPathStr: string | null;
}

export const getVMTreePathInfo = (
  vmSelfLink: string,
  hostTree?: IndexedTree<IInventoryHostTree>,
  vmTree?: IndexedTree<IVMwareFolderTree>
): IVMTreePathInfo => {
  const hostTreeAncestors = hostTree?.ancestorsBySelfLink[vmSelfLink];
  const vmTreeAncestors = vmTree?.ancestorsBySelfLink[vmSelfLink];
  if (!hostTreeAncestors) {
    return {
      datacenter: null,
      cluster: null,
      host: null,
      folders: null,
      folderPathStr: null,
    };
  }
  let folders: ICommonTreeObject[] = [];
  if (vmTreeAncestors) {
    folders =
      (vmTreeAncestors
        ?.filter((node) => !!node && node.kind === 'Folder')
        .map((node) => node.object) as ICommonTreeObject[]) || null;
  }
  return {
    datacenter:
      hostTreeAncestors?.find((node) => node.kind.toLowerCase() === 'datacenter')?.object || null,
    cluster: hostTreeAncestors?.find((node) => node.kind === 'Cluster')?.object || null,
    host: hostTreeAncestors?.find((node) => node.kind === 'Host')?.object || null,
    folders,
    folderPathStr: folders?.map((folder) => folder.name).join('/') || null,
  };
};

export const findMatchingSelectableNode = (
  indexedTree: IndexedTree,
  vmSelfLink: string,
  isNodeSelectable: (node: InventoryTree) => boolean
): InventoryTree | null => {
  const ancestors = indexedTree.ancestorsBySelfLink[vmSelfLink];
  const matchingNode = ancestors?.slice().reverse().find(isNodeSelectable);
  return matchingNode || null;
};

export const findMatchingSelectableDescendants = (
  indexedTree: IndexedTree,
  node: InventoryTree,
  isNodeSelectable: (node: InventoryTree) => boolean
): InventoryTree[] => indexedTree.getDescendants(node, true).filter((n) => isNodeSelectable(n));

export const findNodesMatchingSelectedVMs = (
  indexedTree: IndexedTree,
  selectedVMs: SourceVM[],
  isNodeSelectable: (node: InventoryTree) => boolean
): InventoryTree[] =>
  Array.from(
    new Set(
      selectedVMs
        .map((vm) => findMatchingSelectableNode(indexedTree, vm.selfLink, isNodeSelectable))
        .filter((node) => !!node) as InventoryTree[]
    )
  );

export const filterSourcesBySelectedVMs = (
  availableSources: MappingSource[],
  selectedVMs: SourceVM[],
  mappingType: MappingType,
  sourceProviderType: ProviderType,
  nicProfiles: INicProfile[],
  disks: IDisk[]
): MappingSource[] => {
  const sourceIds: (string | undefined)[] = Array.from(
    new Set(
      selectedVMs.flatMap((vm) => {
        if (mappingType === MappingType.Network) {
          if (sourceProviderType === 'vsphere') {
            return (vm as IVMwareVM).networks.map((network) => network.id);
          }
          if (sourceProviderType === 'ovirt') {
            const vmNicProfiles = (vm as IRHVVM).nics.map((nic) =>
              nicProfiles.find((nicProfile) => nicProfile.id === nic.profile)
            );
            const networkIds = vmNicProfiles.map((nicProfile) => nicProfile?.network);
            return networkIds;
          }
        }

        if (mappingType === MappingType.Storage) {
          if (sourceProviderType === 'vsphere') {
            return (vm as IVMwareVM).disks.map((disk) => disk.datastore.id);
          }
          if (sourceProviderType === 'ovirt') {
            const vmDisks = (vm as IRHVVM).diskAttachments.map((da) =>
              disks.find((disk) => disk.id === da.disk)
            );
            const storageDomainIds = vmDisks.map((disk) => disk?.storageDomain);
            return storageDomainIds;
          }
        }
        return [];
      })
    )
  );

  const filteredSources = availableSources.filter((source) => sourceIds.includes(source.id));
  return filteredSources;
};

export const warmCriticalConcerns = ['Changed Block Tracking (CBT) not enabled'];

export const getMostSevereVMConcern = (vm: SourceVM): ISourceVMConcern | null => {
  if (!vm.concerns || vm.concerns.length === 0) {
    return null;
  }
  const critical = vm.concerns.find((concern) => concern.category === 'Critical');
  const warning = vm.concerns.find((concern) => concern.category === 'Warning');
  const advisory = vm.concerns.find(
    (concern) => concern.category === 'Information' || concern.category === 'Advisory'
  );
  if (critical) return critical;
  if (warning) return warning;
  if (advisory) return advisory;
  // Default to warning if an unexpected severity is found
  return { category: 'Warning', label: 'Unknown', assessment: '' };
};

export const getVMConcernStatusType = (concern: ISourceVMConcern | null): StatusType | null =>
  !concern
    ? 'Ok'
    : concern.category === 'Critical'
    ? 'Error'
    : concern.category === 'Warning'
    ? 'Warning'
    : concern.category === 'Information' || concern.category === 'Advisory'
    ? 'Info'
    : null;

export const getVMConcernStatusLabel = (concern: ISourceVMConcern | null): string =>
  concern?.category === 'Information' || concern?.category === 'Advisory'
    ? 'Advisory'
    : concern?.category || 'Ok';

export const someVMHasConcern = (vms: SourceVM[], concernLabel: string): boolean =>
  vms.some((vm) => vm.concerns.some((concern) => concern.label === concernLabel));

export interface IGenerateMappingsArgs {
  forms: PlanWizardFormState;
  generateName?: string;
  owner?: IPlan;
}

export const generateMappings = ({
  forms,
  generateName,
  owner,
}: IGenerateMappingsArgs): {
  networkMapping: INetworkMapping | null;
  storageMapping: IStorageMapping | null;
} => {
  const { sourceProvider, targetProvider } = forms.general.values;
  const existingMappingRefs = owner?.spec.map;
  const networkMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Network,
          mappingName:
            existingMappingRefs?.network.name || forms.networkMapping.values.newMappingName || null,
          generateName: generateName || null,
          owner,
          sourceProvider,
          targetProvider,
          builderItems: forms.networkMapping.values.builderItems,
        }) as INetworkMapping)
      : null;
  const storageMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Storage,
          mappingName:
            existingMappingRefs?.storage.name || forms.storageMapping.values.newMappingName || null,
          generateName: generateName || null,
          owner,
          sourceProvider,
          targetProvider,
          builderItems: forms.storageMapping.values.builderItems,
        }) as IStorageMapping)
      : null;
  return { networkMapping, storageMapping };
};

interface IHookRef {
  ref: INameNamespaceRef;
  instance: PlanHookInstance;
}

export const generatePlan = (
  forms: PlanWizardFormState,
  networkMappingRef: INameNamespaceRef,
  storageMappingRef: INameNamespaceRef,
  namespace: string,
  hooksRef?: IHookRef[]
): IPlan => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Plan',
  metadata: {
    name: forms.general.values.planName,
    namespace,
  },
  spec: {
    description: forms.general.values.planDescription,
    provider: {
      source: nameAndNamespace(forms.general.values.sourceProvider),
      destination: nameAndNamespace(forms.general.values.targetProvider),
    },
    targetNamespace: forms.general.values.targetNamespace,
    archived: false,
    // Note: This assumes we will only ever allow migration networks that are in the target namespace.
    //       We may want to store migrationNetwork name/namespace in form state instead of just name.
    transferNetwork: forms.general.values.migrationNetwork
      ? {
          name: forms.general.values.migrationNetwork,
          namespace: forms.general.values.targetNamespace,
        }
      : null,
    map: {
      network: networkMappingRef,
      storage: storageMappingRef,
    },
    vms: hooksRef
      ? forms.selectVMs.values.selectedVMIds.map((id) => ({
          id,
          hooks: hooksRef.map((hookRef) => ({ hook: hookRef.ref, step: hookRef.instance.step })),
        }))
      : forms.selectVMs.values.selectedVMIds.map((id) => ({ id })),
    warm: forms.type.values.type === 'Warm',
  },
});

export const getSelectedVMsFromPlan = (
  planBeingPrefilled: IPlan | null,
  indexedVMs: IndexedSourceVMs | undefined
): SourceVM[] => {
  if (!planBeingPrefilled || !indexedVMs) return [];
  return indexedVMs.findVMsByRefs(planBeingPrefilled?.spec.vms);
};

interface IPlanWizardPrefillResults {
  prefillQueryStatus: QueryStatus;
  prefillQueryError: unknown;
  isDonePrefilling: boolean;
  prefillQueries: UseQueryResult<unknown>[];
  prefillErrorTitles: string[];
}

export const usePlanWizardPrefillEffect = (
  forms: PlanWizardFormState,
  planBeingPrefilled: IPlan | null,
  wizardMode: PlanWizardMode,
  namespace: string
): IPlanWizardPrefillResults => {
  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    planBeingPrefilled?.spec.provider || null,
    providersQuery
  );
  const vmsQuery = useSourceVMsQuery(sourceProvider);
  const hostTreeQuery = useInventoryTreeQuery(sourceProvider, InventoryTreeType.Cluster);

  const networkMappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    MappingType.Network
  );
  const storageMappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    MappingType.Storage
  );

  const networkMappingsQuery = useMappingsQuery(MappingType.Network, namespace);
  const storageMappingsQuery = useMappingsQuery(MappingType.Storage, namespace);

  const hooksQuery = useHooksQuery(namespace);
  const plansQuery = usePlansQuery(namespace);

  const queries = [
    providersQuery,
    vmsQuery,
    hostTreeQuery,
    ...networkMappingResourceQueries.queries,
    ...storageMappingResourceQueries.queries,
    networkMappingsQuery,
    storageMappingsQuery,
    hooksQuery,
    plansQuery,
  ];
  const errorTitles = [
    'Cannot load providers',
    'Cannot load VMs',
    'Cannot load inventory tree data',
    'Cannot load source networks',
    'Cannot load target networks',
    'Cannot load source storages',
    'Cannot load target storage classes',
    'Cannot load network mappings',
    'Cannot load storage mappings',
    'Cannot load hooks',
    'Cannot load plans',
  ];

  const queryStatus = getAggregateQueryStatus(queries);
  const queryError = getFirstQueryError(queries);

  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(wizardMode === 'create');

  const defaultTreeType = InventoryTreeType.Cluster;
  const isNodeSelectable = useIsNodeSelectableCallback(defaultTreeType);
  const nicProfilesQuery = useNicProfilesQuery(sourceProvider);
  const disksQuery = useDisksQuery(sourceProvider);

  React.useEffect(() => {
    if (
      !isStartedPrefilling &&
      queryStatus === 'success' &&
      planBeingPrefilled &&
      hostTreeQuery.data
    ) {
      setIsStartedPrefilling(true);
      const selectedVMs = getSelectedVMsFromPlan(planBeingPrefilled, vmsQuery.data);
      const selectedTreeNodes = findNodesMatchingSelectedVMs(
        hostTreeQuery.data,
        selectedVMs,
        isNodeSelectable
      );
      const networkMapping = networkMappingsQuery.data?.items.find((mapping) =>
        isSameResource(mapping.metadata, planBeingPrefilled.spec.map.network)
      );
      const storageMapping = storageMappingsQuery.data?.items.find((mapping) =>
        isSameResource(mapping.metadata, planBeingPrefilled.spec.map.storage)
      );

      if (wizardMode === 'edit') {
        forms.general.fields.planName.prefill(planBeingPrefilled.metadata.name);
      } else if (wizardMode === 'duplicate') {
        forms.general.fields.planName.prefill(
          duplicatedPlanDefaultName(planBeingPrefilled, plansQuery)
        );
      }
      if (planBeingPrefilled.spec.description) {
        forms.general.fields.planDescription.prefill(planBeingPrefilled.spec.description);
      }
      forms.general.fields.sourceProvider.prefill(sourceProvider);
      forms.general.fields.targetProvider.prefill(targetProvider);
      forms.general.fields.targetNamespace.prefill(planBeingPrefilled.spec.targetNamespace);
      forms.general.fields.migrationNetwork.prefill(
        planBeingPrefilled.spec.transferNetwork?.name || null
      );

      forms.filterVMs.fields.treeType.prefill(defaultTreeType);
      forms.filterVMs.fields.selectedTreeNodes.prefill(selectedTreeNodes);
      forms.filterVMs.fields.isPrefilled.prefill(true);

      forms.selectVMs.fields.selectedVMIds.prefill(selectedVMs.map((vm) => vm.id));

      forms.networkMapping.fields.builderItems.prefill(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            networkMapping?.spec.map || [],
            MappingType.Network,
            networkMappingResourceQueries.availableSources,
            networkMappingResourceQueries.availableTargets
          ),
          networkMappingResourceQueries,
          selectedVMs,
          MappingType.Network,
          sourceProvider?.type || 'vsphere',
          false,
          nicProfilesQuery?.data || [],
          disksQuery?.data || []
        )
      );
      forms.networkMapping.fields.isPrefilled.prefill(true);

      forms.storageMapping.fields.builderItems.prefill(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            storageMapping?.spec.map || [],
            MappingType.Storage,
            storageMappingResourceQueries.availableSources,
            storageMappingResourceQueries.availableTargets
          ),
          storageMappingResourceQueries,
          selectedVMs,
          MappingType.Storage,
          sourceProvider?.type || 'vsphere',
          false,
          nicProfilesQuery?.data || [],
          disksQuery?.data || []
        )
      );
      forms.storageMapping.fields.isPrefilled.prefill(true);

      forms.type.fields.type.prefill(planBeingPrefilled.spec.warm ? 'Warm' : 'Cold');

      forms.hooks.fields.instances.prefill(
        getPlanHookFormInstances(planBeingPrefilled, hooksQuery)
      );

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    queryStatus,
    forms,
    planBeingPrefilled,
    wizardMode,
    sourceProvider,
    targetProvider,
    networkMappingResourceQueries,
    storageMappingResourceQueries,
    vmsQuery,
    hostTreeQuery,
    networkMappingsQuery,
    storageMappingsQuery,
    hooksQuery,
    plansQuery,
    defaultTreeType,
    isNodeSelectable,
    disksQuery?.data,
    nicProfilesQuery?.data,
  ]);

  return {
    prefillQueryStatus: queryStatus,
    prefillQueryError: queryError,
    isDonePrefilling,
    prefillQueries: queries,
    prefillErrorTitles: errorTitles,
  };
};

export const duplicatedPlanDefaultName = (
  planBeingPrefilled: IPlan,
  plansQuery: UseQueryResult<IKubeList<IPlan>>
) => {
  let name = `copy-of-${planBeingPrefilled.metadata.name}`;
  let increment = 0;
  while (plansQuery.data?.items.find((plan) => plan.metadata.name === name)) {
    increment++;
    name = `copy-of-${planBeingPrefilled.metadata.name}-${increment}`;
  }
  return name;
};

export const concernMatchesFilter = (concern: ISourceVMConcern, filterText?: string): boolean =>
  !!filterText &&
  `${concern.label}: ${concern.assessment}`.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;

export const vmMatchesConcernFilter = (vm: SourceVM, filterText?: string): boolean =>
  !!filterText && vm.concerns.some((concern) => concernMatchesFilter(concern, filterText));

export const generateHook = ({
  instance,
  existingHook,
  namespace,
  generateName,
  owner,
}: {
  instance: PlanHookInstance;
  existingHook: INameNamespaceRef | null;
  namespace: string;
  generateName?: string;
  owner?: IPlan;
}): IHook => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Hook',
  metadata: {
    ...(existingHook ? { name: existingHook.name } : { generateName: generateName || '' }),
    namespace,
    ...(owner ? { ownerReferences: [getObjectRef(owner)] } : {}),
  },
  spec: {
    ...(instance.type === 'playbook'
      ? { playbook: btoa(instance.playbook), image: 'quay.io/konveyor/hook-runner:latest' }
      : { image: instance.image }),
  },
});

export const getPlanHookFormInstances = (
  plan: IPlan,
  hooksQuery: UseQueryResult<IKubeList<IHook>>
): PlanHookInstance[] => {
  if (plan.spec.vms.length === 0) return [];
  const planHookRefs = plan.spec.vms[0].hooks || [];
  const hooksAllMatch = plan.spec.vms.every(
    (vm) =>
      (vm.hooks || []).length === planHookRefs.length &&
      (vm.hooks || []).every(
        (planHookRef) => !!planHookRefs.find((ref) => isSameResource(ref.hook, planHookRef.hook))
      )
  );
  if (!hooksAllMatch) {
    alert(`
      WARNING: This plan is not using the same hooks on all VMs.
      The API supports arbitrary hooks for each VM, but the UI only supports one set of hooks for all VMs.
      The hooks from the first VM in the plan will be used, and other hooks will be lost.
    `);
  }
  const instances: PlanHookInstance[] = [];
  planHookRefs.forEach((planHookRef) => {
    const matchingHook = (hooksQuery.data?.items || []).find((hook) => {
      return isSameResource(hook.metadata, planHookRef.hook);
    });

    if (matchingHook) {
      instances.push({
        step: planHookRef.step,
        type: matchingHook.spec.playbook ? 'playbook' : 'image',
        playbook: atob(matchingHook.spec.playbook || ''),
        image: matchingHook.spec.playbook ? '' : matchingHook.spec.image || '',
        prefilledFromHook: matchingHook,
      });
    }
  });

  return instances;
};
