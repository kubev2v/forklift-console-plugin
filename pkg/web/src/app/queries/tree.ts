import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { getInventoryApiUrl, useMockableQuery } from './helpers';
import { MOCK_RHV_HOST_TREE, MOCK_VMWARE_HOST_TREE, MOCK_VMWARE_VM_TREE } from './mocks/tree.mock';
import { SourceInventoryProvider } from './types';
import { InventoryTree, InventoryTreeType } from './types/tree.types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

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
  // VMware providers have both Host and VM trees, but RHV only has Host trees.
  const isValidQuery = provider?.type === 'vsphere' || treeType === InventoryTreeType.Cluster;
  const apiSlug =
    treeType === InventoryTreeType.Cluster
      ? provider?.type === 'vsphere'
        ? '/tree/host' // TODO in the future, this vsphere tree will also be at /tree/cluster
        : '/tree/cluster'
      : '/tree/vm';

  return useMockableQuery<T, unknown, IndexedTree<T>>(
    {
      queryKey: ['inventory-tree', provider?.name, treeType],
      queryFn: async () =>
        await consoleFetchJSON(getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug}`)),
      enabled: isValidQuery && !!provider,
      keepPreviousData: true,
      cacheTime: 0,
      select: indexTreeCallback,
    },
    (treeType === InventoryTreeType.Cluster
      ? provider?.type === 'vsphere'
        ? MOCK_VMWARE_HOST_TREE
        : MOCK_RHV_HOST_TREE
      : MOCK_VMWARE_VM_TREE) as T
  );
};
