import type { ProviderVmData } from 'src/utils/types';

import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
import { COLUMN_IDS, ROW_TYPE, type VmRow } from '@components/VsphereFoldersTable/utils/types';

type ConcernStub = { category?: string; label?: string };

type MakeVmRowOverrides = Partial<VmRow> & {
  concerns?: ConcernStub[];
  guestName?: string;
  host?: string;
  name?: string;
  path?: string;
  powerState?: string;
};

export const makeVmRow = (overrides: MakeVmRowOverrides = {}): VmRow => {
  const {
    name = 'vm-a',
    host = 'esxi-1',
    path = '/dc/vm/folder/vm-a',
    powerState = 'poweredOn',
    guestName,
    concerns = [],
    ...rowOverrides
  } = overrides;

  const vmData: ProviderVmData = {
    folderName: 'folder',
    hostName: host,
    name,
    namespace: 'ns',
    vm: {
      concerns,
      guestName,
      id: name,
      name,
      path,
      powerState,
      providerType: 'vsphere',
    } as never,
  };

  return {
    isHidden: false,
    isSelected: false,
    key: `vm-${name}`,
    parentFolderKey: 'folder-folder',
    treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
    type: ROW_TYPE.Vm,
    vmData,
    ...rowOverrides,
  };
};

export const criticalConcern = { category: ConcernCategoryOptions.Critical, label: 'CPU' };
export const warningConcern = { category: ConcernCategoryOptions.Warning, label: 'Disk' };
export const infoConcern = { category: ConcernCategoryOptions.Information, label: 'NIC' };

export const nameSortAsc = { column: COLUMN_IDS.Name, direction: 'asc' as const };
export const nameSortDesc = { column: COLUMN_IDS.Name, direction: 'desc' as const };
