import { indexTree } from '..';
import { MOCK_VMWARE_HOST_TREE } from '../mocks/tree.mock';
import { InventoryTree } from '../types';

describe('indexTree', () => {
  const indexedTree = indexTree(MOCK_VMWARE_HOST_TREE);

  // Quick helpers to walk the tree by child indexes for easier testing.
  // Even though this has some complexity, results matching the real algorithms are sufficient for a meaningful test.
  const walkSubtree = (
    subtree: InventoryTree | null,
    indexes: number[],
    pathSoFar: InventoryTree[]
  ): InventoryTree[] => {
    if (!subtree) return pathSoFar;
    if (indexes.length === 0) return [...pathSoFar, subtree];
    return walkSubtree(
      (subtree.children && subtree.children[indexes[0]]) || null,
      indexes.slice(1),
      [...pathSoFar, subtree]
    );
  };
  const walk = (indexes: number[]): InventoryTree[] => walkSubtree(indexedTree.tree, indexes, []);
  const find = (indexes: number[]): InventoryTree => {
    const path = walk(indexes);
    return path[path.length - 1];
  };

  it('sorts a tree properly', () => {
    const v2vDC = indexedTree.tree.children?.find((node) => node.object?.name === 'V2V-DC');
    expect(
      v2vDC?.children?.findIndex((node) => node.object?.name === 'V2V_Cluster') || 0
    ).toBeGreaterThan(
      v2vDC?.children?.findIndex((node) => node.object?.name === 'Fake_Cluster') || 0
    );
  });

  it('flattens nodes properly', () => {
    const allNodeNames = indexedTree.flattenedNodes.map((node) => node.object?.name || null);
    expect(allNodeNames).toEqual([
      'Fake_DC',
      'V2V-DC',
      'Fake_Cluster',
      'V2V_Cluster',
      'fake-host',
      'esx13.v2v.bos.redhat.com',
      'fdupont%2ftest',
      'fdupont-test-migration',
      'fdupont-test-migration-centos',
      'pemcg-discovery01',
      'vm-template-test',
      'fake-host',
      'pemcg-iscsi-target',
    ]);
  });

  it('finds all VM selfLinks', () => {
    expect(indexedTree.vmSelfLinks).toEqual([
      '/providers/vsphere/test/vms/vm-2844',
      '/providers/vsphere/test/vms/vm-1630',
      '/providers/vsphere/test/vms/vm-1008',
      '/providers/vsphere/test/vms/vm-2685',
      '/providers/vsphere/test/vms/vm-template-test',
      '/providers/vsphere/test/vms/vm-431',
    ]);
  });

  it('indexes all tree ancestors by selfLink', () => {
    expect(indexedTree.ancestorsBySelfLink).toEqual({
      '/providers/vsphere/test4/datacenters/datacenter-2760': walk([0]),
      '/providers/vsphere/test4/datacenters/datacenter-21': walk([1]),
      '/providers/vsphere/test4/clusters/domain-c2758': walk([1, 0]),
      '/providers/vsphere/test4/clusters/domain-c26': walk([1, 1]),
      '/providers/vsphere/test4/hosts/host-29': walk([1, 1, 0]),
      '/providers/vsphere/test/vms/vm-2844': walk([1, 1, 0, 0]),
      '/providers/vsphere/test/vms/vm-1630': walk([1, 1, 0, 1]),
      '/providers/vsphere/test/vms/vm-1008': walk([1, 1, 0, 2]),
      '/providers/vsphere/test/vms/vm-2685': walk([1, 1, 0, 3]),
      '/providers/vsphere/test/vms/vm-template-test': walk([1, 1, 0, 4]),
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/clusters/domain-s8928': walk([1, 2]),
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/hosts/host-8930': walk([1, 2, 0]),
      '/providers/vsphere/test/vms/vm-431': walk([1, 2, 0, 0]),
    });
  });

  it('indexes all descendants by selfLink', () => {
    expect(indexedTree.descendantsBySelfLink).toEqual({
      '/providers/vsphere/test4/datacenters/datacenter-2760': [],
      '/providers/vsphere/test4/datacenters/datacenter-21': [
        find([1, 0]),
        find([1, 1]),
        find([1, 2]),
        find([1, 1, 0]),
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
        find([1, 2, 0]),
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/test4/clusters/domain-c2758': [],
      '/providers/vsphere/test4/clusters/domain-c26': [
        find([1, 1, 0]),
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
      ],
      '/providers/vsphere/test4/hosts/host-29': [
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
      ],
      '/providers/vsphere/test/vms/vm-2844': [],
      '/providers/vsphere/test/vms/vm-1630': [],
      '/providers/vsphere/test/vms/vm-1008': [],
      '/providers/vsphere/test/vms/vm-2685': [],
      '/providers/vsphere/test/vms/vm-template-test': [],
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/clusters/domain-s8928': [
        find([1, 2, 0]),
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/hosts/host-8930': [
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/test/vms/vm-431': [],
    });
  });

  it('indexes VM descendants by selfLink', () => {
    expect(indexedTree.vmDescendantsBySelfLink).toEqual({
      '/providers/vsphere/test4/datacenters/datacenter-2760': [],
      '/providers/vsphere/test4/datacenters/datacenter-21': [
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/test4/clusters/domain-c2758': [],
      '/providers/vsphere/test4/clusters/domain-c26': [
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
      ],
      '/providers/vsphere/test4/hosts/host-29': [
        find([1, 1, 0, 0]),
        find([1, 1, 0, 1]),
        find([1, 1, 0, 2]),
        find([1, 1, 0, 3]),
        find([1, 1, 0, 4]),
      ],
      '/providers/vsphere/test/vms/vm-2844': [],
      '/providers/vsphere/test/vms/vm-1630': [],
      '/providers/vsphere/test/vms/vm-1008': [],
      '/providers/vsphere/test/vms/vm-2685': [],
      '/providers/vsphere/test/vms/vm-template-test': [],
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/clusters/domain-s8928': [
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/hosts/host-8930': [
        find([1, 2, 0, 0]),
      ],
      '/providers/vsphere/test/vms/vm-431': [],
    });
  });

  it('properly gets descendants both including and not including the given node', () => {
    const dc21 = find([1]);
    const descendantsOfDC21 = [
      find([1, 0]),
      find([1, 1]),
      find([1, 2]),
      find([1, 1, 0]),
      find([1, 1, 0, 0]),
      find([1, 1, 0, 1]),
      find([1, 1, 0, 2]),
      find([1, 1, 0, 3]),
      find([1, 1, 0, 4]),
      find([1, 2, 0]),
      find([1, 2, 0, 0]),
    ];

    expect(indexedTree.getDescendants(dc21)).toEqual([dc21, ...descendantsOfDC21]); // Defaults to true
    expect(indexedTree.getDescendants(dc21, true)).toEqual([dc21, ...descendantsOfDC21]);
    expect(indexedTree.getDescendants(dc21, false)).toEqual(descendantsOfDC21);
  });

  it('gets descendants of the root node even though it has no object/selfLink', () => {
    const descendantsIncludingRoot = indexedTree.getDescendants(MOCK_VMWARE_HOST_TREE, true);
    const descendantsNotIncludingRoot = indexedTree.getDescendants(MOCK_VMWARE_HOST_TREE, false);
    expect(descendantsIncludingRoot.map((node) => node.object?.name)).toEqual(
      [MOCK_VMWARE_HOST_TREE, ...indexedTree.flattenedNodes].map((node) => node.object?.name)
    );
    expect(descendantsNotIncludingRoot.map((node) => node.object?.name)).toEqual(
      indexedTree.flattenedNodes.map((node) => node.object?.name)
    );
  });
});
