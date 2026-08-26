import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

jest.mock('@utils/hooks/useVmInspectionStatus', () => ({
  useVmInspectionStatus: (): (() => undefined) => (): undefined => undefined,
}));

import { renderHook } from '@testing-library/react';

import { COLUMN_IDS, folderFilterId, ROW_TYPE, type VmRow } from '../../utils/types';
import { useTreeFilterAttributes } from '../useTreeFilterAttributes';

const makeVmRow = (overrides: Partial<VmRow> = {}): VmRow =>
  ({
    isHidden: false,
    key: 'vm-1',
    parentFolderKey: 'folder-a',
    treeRow: { props: {} } as VmRow['treeRow'],
    type: ROW_TYPE.Vm,
    vmData: {
      folderName: 'Folder A',
      hostName: 'esxi-1',
      name: 'vm-1',
      namespace: 'ns',
      vm: { id: '1', name: 'vm-1' },
    },
    ...overrides,
  }) as VmRow;

describe('useTreeFilterAttributes', () => {
  it('returns expected attribute ids and kinds', () => {
    const { result } = renderHook(() => useTreeFilterAttributes([], []));
    const ids = result.current.map((attr) => attr.id);

    expect(ids).toEqual([
      COLUMN_IDS.Name,
      COLUMN_IDS.GuestOS,
      folderFilterId,
      `${COLUMN_IDS.Concerns}-type`,
      `${COLUMN_IDS.Concerns}-label`,
      COLUMN_IDS.InspectionStatus,
      COLUMN_IDS.Host,
      COLUMN_IDS.Power,
      COLUMN_IDS.Path,
    ]);
    expect(result.current.every((attr) => attr.label)).toBe(true);
  });

  it('exposes folder name getter that defaults to empty string', () => {
    const { result } = renderHook(() => useTreeFilterAttributes([], []));
    const folderAttr = result.current.find((attr) => attr.id === folderFilterId);
    expect(folderAttr?.kind).toBe('text');
    expect(
      folderAttr && 'getValue' in folderAttr
        ? folderAttr.getValue(
            makeVmRow({
              vmData: {
                folderName: undefined,
                hostName: 'esxi-1',
                name: 'vm',
                namespace: 'ns',
                vm: { id: '1', name: 'vm' },
              },
            } as Partial<VmRow>),
          )
        : undefined,
    ).toBe('');
  });

  it('rebuilds attributes when rows change', () => {
    const { result, rerender } = renderHook(({ rows }) => useTreeFilterAttributes(rows, []), {
      initialProps: { rows: [] as VmRow[] },
    });
    const first = result.current;
    rerender({ rows: [makeVmRow()] });
    expect(result.current).not.toBe(first);
    expect(result.current).toHaveLength(first.length);
  });
});
