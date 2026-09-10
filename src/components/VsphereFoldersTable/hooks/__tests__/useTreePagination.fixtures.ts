import {
  BlockKind,
  type ConcernsRow,
  type FolderBlock,
  type FolderRow,
  type RootBlock,
  ROW_TYPE,
  type VmRow,
} from '../../utils/types';

const folder = (name: string, overrides: Partial<FolderRow> = {}): FolderRow => ({
  folderName: name,
  isHidden: false,
  key: `folder-${name}`,
  treeRow: { props: {} } as FolderRow['treeRow'],
  type: ROW_TYPE.Folder,
  ...overrides,
});

const vm = (name: string, overrides: Partial<VmRow> = {}): VmRow =>
  ({
    isHidden: false,
    key: `vm-${name}`,
    parentFolderKey: 'folder-a',
    treeRow: { props: {} } as VmRow['treeRow'],
    type: ROW_TYPE.Vm,
    vmData: { name, namespace: 'ns', vm: { id: name, name, providerType: 'vsphere' } },
    ...overrides,
  }) as VmRow;

const concerns = (name: string, isHidden = false): ConcernsRow =>
  ({
    isHidden,
    key: `concerns-${name}`,
    parentFolderKey: 'folder-a',
    type: ROW_TYPE.Concerns,
    vmData: { name, namespace: 'ns', vm: { id: name, name, providerType: 'vsphere' } },
  }) as ConcernsRow;

export const folderBlock = (
  name: string,
  vmNames: string[],
  opts?: { collapsed?: boolean; hideConcerns?: boolean },
): FolderBlock => ({
  folder: folder(name),
  items: vmNames.map((vmName) => ({
    concerns: opts?.hideConcerns ? undefined : concerns(vmName),
    vm: vm(vmName, {
      isHidden: Boolean(opts?.collapsed),
      parentFolderKey: `folder-${name}`,
    }),
  })),
  kind: BlockKind.Folder,
});

export const collapsedFolderBlock = (name: string): FolderBlock => ({
  folder: folder(name),
  items: [],
  kind: BlockKind.Folder,
});

export const rootBlock = (vmNames: string[]): RootBlock => ({
  items: vmNames.map((vmName) => ({
    concerns: concerns(vmName),
    vm: vm(vmName, { parentFolderKey: 'root' }),
  })),
  kind: BlockKind.Root,
});
