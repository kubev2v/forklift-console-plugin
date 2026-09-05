import { ROW_TYPE } from '@components/VsphereFoldersTable/utils/types';

import {
  cmpStr,
  getFolderNameFromFolderRow,
  getVmConcernCategories,
  getVmGuestOSValue,
  getVmHost,
  getVmName,
  getVmPath,
  getVmPower,
  getVmRowsId,
} from '../vmRowAccessors';

import { criticalConcern, infoConcern, makeVmRow, warningConcern } from './fixtures';

describe('vmRowAccessors - fields', () => {
  it('reads vm name, guest OS, host, path and power', () => {
    const row = makeVmRow({
      guestName: 'RHEL 9',
      host: 'host-a',
      name: 'web',
      path: '/dc/web',
      powerState: 'poweredOff',
    });

    expect(getVmName(row)).toBe('web');
    expect(getVmGuestOSValue(row)).toBe('RHEL 9');
    expect(getVmHost(row)).toBe('host-a');
    expect(getVmPath(row)).toBe('/dc/web');
    expect(getVmPower(row)).toBe('off');
  });

  it('returns empty strings for missing optional fields', () => {
    const row = makeVmRow({ host: '', name: 'x', path: undefined as never });
    row.vmData.name = undefined as never;
    row.vmData.hostName = undefined;
    (row.vmData.vm as { path?: string }).path = undefined;

    expect(getVmName(row)).toBe('');
    expect(getVmHost(row)).toBe('');
    expect(getVmPath(row)).toBe('');
    expect(getVmGuestOSValue(row)).toBe('');
  });

  it('collects vm ids from mixed rows', () => {
    const vm = makeVmRow({ name: 'vm-1' });
    const folder = {
      folderName: 'f1',
      isHidden: false as const,
      key: 'folder-f1',
      treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
      type: ROW_TYPE.Folder,
    };

    expect(getVmRowsId([folder, vm])).toEqual(['vm-1']);
    expect(getVmRowsId([])).toEqual([]);
  });

  it('extracts valid concern categories and ignores unknowns', () => {
    const row = makeVmRow({
      concerns: [criticalConcern, warningConcern, infoConcern, { category: 'Bogus', label: 'x' }],
    });

    expect(
      getVmConcernCategories(row).toSorted((left, right) => left.localeCompare(right)),
    ).toEqual(['Critical', 'Information', 'Warning']);
  });

  it('returns empty categories when concerns missing or not an array', () => {
    expect(getVmConcernCategories(makeVmRow({ concerns: undefined as never }))).toEqual([]);
    const row = makeVmRow();
    (row.vmData.vm as { concerns?: unknown }).concerns = { bad: true };
    expect(getVmConcernCategories(row)).toEqual([]);
  });

  it('compares strings case-insensitively', () => {
    expect(cmpStr('a', 'B')).toBeLessThan(0);
    expect(cmpStr('B', 'a')).toBeGreaterThan(0);
    expect(cmpStr('Same', 'same')).toBe(0);
  });

  it('reads folder name only for folder rows', () => {
    const folder = {
      folderName: 'Prod',
      isHidden: false as const,
      key: 'folder-Prod',
      treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
      type: ROW_TYPE.Folder,
    };
    expect(getFolderNameFromFolderRow(folder)).toBe('Prod');
    expect(getFolderNameFromFolderRow(makeVmRow())).toBe('');
  });
});
