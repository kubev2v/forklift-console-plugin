import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { getInventoryApiUrl, useMockableQuery } from './helpers';
import {
  MOCK_OPENSTACK_HOST_TREE,
  MOCK_RHV_HOST_TREE,
  MOCK_VMWARE_HOST_TREE,
  MOCK_VMWARE_VM_TREE,
} from './mocks/tree.mock';
import { SourceInventoryProvider } from './types';
import {
  ICommonTreeObject,
  IInventoryHostTree,
  InventoryTree,
  InventoryTreeType,
} from './types/tree.types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { ProviderType } from '../common/constants';
import { usePollingContext } from '../common/context';

const sortTreeItemsByName = <T extends InventoryTree>(tree: T): T => ({
  ...tree,
  children:
    tree.children &&
    (tree.children as T[]).map(sortTreeItemsByName).sort((a?: T, b?: T) => {
      if (!a || !a.object) return -1;
      if (!b || !b.object) return 1;
      // Put standalone hosts (variant = ComputeResource) after all siblings
      if (a.object.variant === 'ComputeResource' && b.object.variant !== 'ComputeResource')
        return 1;
      if (a.object.variant !== 'ComputeResource' && b.object.variant === 'ComputeResource')
        return -1;
      return a.object.name < b.object.name ? -1 : 1;
    }),
});

export interface IndexedTree<T extends InventoryTree = InventoryTree> {
  tree: T;
  flattenedNodes: T[];
  vmSelfLinks: string[];
  ancestorsBySelfLink: Record<string, T[] | undefined>; // Flattened list of nodes leading to each node
  descendantsBySelfLink: Record<string, T[] | undefined>; // Flattened list of nodes under each node
  vmDescendantsBySelfLink: Record<string, T[] | undefined>; // Flattened list of only VM nodes under each node
  getDescendants: (node: InventoryTree, includeSelf?: boolean) => InventoryTree[];
}

export const indexTree = <T extends InventoryTree>(tree: T): IndexedTree<T> => {
  const sortedTree = sortTreeItemsByName(tree);
  const vmSelfLinks: string[] = [];
  const ancestorsBySelfLink: Record<string, T[] | undefined> = {};
  const descendantsBySelfLink: Record<string, T[] | undefined> = {};
  const vmDescendantsBySelfLink: Record<string, T[] | undefined> = {};
  const walk = (node: T, ancestors: T[] = []): T[] => {
    if (node.object) {
      if (node.kind === 'VM') vmSelfLinks.push(node.object.selfLink);
      ancestorsBySelfLink[node.object.selfLink] = [...ancestors, node];
      descendantsBySelfLink[node.object.selfLink] = [];
      vmDescendantsBySelfLink[node.object.selfLink] = [];
    }
    if (node.children) {
      const children = node.children as T[];
      const flattenedDescendants = [
        ...children,
        ...children.flatMap((childNode) => walk(childNode, [...ancestors, node])),
      ];
      if (node.object) {
        descendantsBySelfLink[node.object.selfLink] = flattenedDescendants;
        vmDescendantsBySelfLink[node.object.selfLink] = flattenedDescendants.filter(
          (n) => n.kind === 'VM'
        );
      }
      return flattenedDescendants;
    }
    return [];
  };
  const getDescendants = (node: InventoryTree, includeSelf = true) => {
    // The root node is likely the only node with no `object`, so this will probably never recurse more than once.
    const descendants = node.object
      ? descendantsBySelfLink[node.object.selfLink || ''] || []
      : node.children?.flatMap((child: InventoryTree) => getDescendants(child, true)) || [];
    return includeSelf ? [node, ...descendants] : descendants;
  };
  return {
    tree: sortedTree,
    flattenedNodes: walk(sortedTree),
    vmSelfLinks,
    ancestorsBySelfLink,
    descendantsBySelfLink,
    vmDescendantsBySelfLink,
    getDescendants,
  };
};

export const useInventoryTreeQuery = <T extends InventoryTree>(
  provider: SourceInventoryProvider | null,
  treeType: InventoryTreeType
): UseQueryResult<IndexedTree<T>> => {
  const indexTreeCallback = React.useCallback((data): IndexedTree<T> => indexTree(data), []);
  // only VMware have a VM trees.
  const isValidVMTree = treeType === InventoryTreeType.VM && provider?.type === 'vsphere';
  const isValidClusterTree = treeType === InventoryTreeType.Cluster;
  const apiSlugByProviderType: Record<ProviderType, string> = {
    vsphere: '/tree/host',
    ovirt: '/tree/cluster',
    openstack: '/tree/project',
    openshift: '/tree/namespace',
    ova: '/vms?detail=4',
  };
  const mockTreeData: Record<ProviderType, IInventoryHostTree> = {
    vsphere: MOCK_VMWARE_HOST_TREE,
    ovirt: MOCK_RHV_HOST_TREE,
    openstack: MOCK_OPENSTACK_HOST_TREE,
    openshift: undefined,
    ova: undefined,
  };

  const apiSlug =
    treeType === InventoryTreeType.Cluster ? apiSlugByProviderType[provider?.type] : '/tree/vm';

  const apiMockData =
    treeType === InventoryTreeType.Cluster ? mockTreeData[provider?.type] : MOCK_VMWARE_VM_TREE;

  return useMockableQuery<T, unknown, IndexedTree<T>>(
    {
      queryKey: ['inventory-tree', provider?.name, treeType],
      queryFn: async () => {
        const result = await consoleFetchJSON(
          getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug}`)
        );

        if (provider.type === 'ova') {
          return createTreeFromVMs(result);
        } else {
          return result;
        }
      },
      enabled: (isValidClusterTree || isValidVMTree) && !!provider,
      cacheTime: 0,
      refetchInterval: usePollingContext().refetchInterval,
      select: indexTreeCallback,
    },
    apiMockData as T
  );
};

function createTreeFromVMs(vms: ICommonTreeObject[]): InventoryTree {
  // Create children nodes from VMs
  const children: InventoryTree[] = vms.map((vm) => ({
    kind: 'VM',
    object: { id: vm.name, ...vm },
    children: null,
  }));

  // Create root node
  const rootNode: InventoryTree = {
    kind: 'Folder',
    object: {
      name: 'default',
      id: 'default',
      selfLink: '/default',
    },
    children: children,
  };

  // Create the final tree
  const tree: InventoryTree = {
    kind: '',
    object: null,
    children: [rootNode],
  };

  return tree;
}
