import { type ConcernsRow, type FolderRow, ROW_TYPE, type VmRow } from '../../utils/types';
import { FOLDER_PREFIX, NO_FOLDER } from '../utils/constants';

export const folder = (name: string, overrides: Partial<FolderRow> = {}): FolderRow => ({
  folderName: name,
  isHidden: false,
  key: `${FOLDER_PREFIX}${name}`,
  treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
  type: ROW_TYPE.Folder,
  ...overrides,
});

export const vm = (name: string, overrides: Partial<VmRow> = {}): VmRow => ({
  isHidden: false,
  isSelected: false,
  key: `vm-${name}`,
  parentFolderKey: `${FOLDER_PREFIX}a`,
  treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
  type: ROW_TYPE.Vm,
  vmData: { name, namespace: 'ns', vm: { id: name, name } as never },
  ...overrides,
});

export const concerns = (name: string, overrides: Partial<ConcernsRow> = {}): ConcernsRow => ({
  isHidden: false,
  key: `concerns-${name}`,
  parentFolderKey: `${FOLDER_PREFIX}a`,
  type: ROW_TYPE.Concerns,
  vmData: { name, namespace: 'ns', vm: { id: name, name } as never },
  ...overrides,
});

export const folderTreeRows = [
  folder('a'),
  vm('vm-1', { isSelected: true, parentFolderKey: `${FOLDER_PREFIX}a` }),
  concerns('vm-1'),
  vm('vm-2', { parentFolderKey: `${FOLDER_PREFIX}a` }),
  concerns('vm-2', { isHidden: true }),
  folder('b'),
  vm('vm-3', { isSelected: true, parentFolderKey: `${FOLDER_PREFIX}b` }),
  concerns('vm-3', { parentFolderKey: `${FOLDER_PREFIX}b` }),
  vm('root-1', { parentFolderKey: NO_FOLDER }),
  concerns('root-1', { parentFolderKey: NO_FOLDER }),
];
