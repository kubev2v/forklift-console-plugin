import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

jest.mock('@utils/hooks/useVmInspectionStatus', () => ({
  useVmInspectionStatus: (): (() => undefined) => (): undefined => undefined,
}));

import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
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

const optionLabels = (attrs: ReturnType<typeof useTreeFilterAttributes>, id: string): string[] => {
  const attr = attrs.find((entry) => entry.id === id);
  return attr && 'options' in attr
    ? (attr.options?.flatMap((option) => (option.label ? [option.label] : [])) ?? [])
    : [];
};

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

  it('rebuilds host and concern options when rows change', () => {
    const { result, rerender } = renderHook(({ rows }) => useTreeFilterAttributes(rows, []), {
      initialProps: { rows: [] as VmRow[] },
    });

    expect(optionLabels(result.current, COLUMN_IDS.Host)).toEqual([]);
    expect(optionLabels(result.current, `${COLUMN_IDS.Concerns}-label`)).toEqual([]);

    rerender({
      rows: [
        makeVmRow({
          vmData: {
            folderName: 'Folder A',
            hostName: 'esxi-2',
            name: 'vm-1',
            namespace: 'ns',
            vm: {
              concerns: [
                {
                  assessment: 'CPU usage high',
                  category: ConcernCategoryOptions.Critical,
                  id: 'c1',
                  label: 'CPU',
                },
              ],
              id: '1',
              name: 'vm-1',
            },
          },
        }),
      ],
    });

    expect(optionLabels(result.current, COLUMN_IDS.Host)).toEqual(['esxi-2']);
    expect(optionLabels(result.current, `${COLUMN_IDS.Concerns}-label`)).toEqual(['CPU']);
  });
});
