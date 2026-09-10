import { ROW_TYPE } from '@components/VsphereFoldersTable/utils/types';

import {
  getConcernLabelFilterOptions,
  getHostnameFilterOptions,
  getVmConcernLabels,
} from '../vmRowAccessors';

import { criticalConcern, infoConcern, makeVmRow, warningConcern } from './fixtures';

describe('vmRowAccessors - concernLabels', () => {
  it('builds unique labels with icons and categories', () => {
    const row = makeVmRow({
      concerns: [criticalConcern, warningConcern, { category: 'Critical', label: '  ' }],
    });
    const { categoryMapper, labelIconMapper, labels } = getVmConcernLabels(row);

    expect(labels.toSorted((left, right) => left.localeCompare(right))).toEqual(['CPU', 'Disk']);
    expect(categoryMapper.CPU).toBe('Critical');
    expect(labelIconMapper.CPU).toBeDefined();
  });

  it('returns empty maps when concerns are missing or not an array', () => {
    expect(getVmConcernLabels(makeVmRow({ concerns: undefined as never }))).toEqual({
      categoryMapper: {},
      labelIconMapper: {},
      labels: [],
    });
    const row = makeVmRow();
    (row.vmData.vm as { concerns?: unknown }).concerns = { bad: true };
    expect(getVmConcernLabels(row)).toEqual({
      categoryMapper: {},
      labelIconMapper: {},
      labels: [],
    });
  });

  it('builds concern filter options sorted by severity', () => {
    const rows = [
      makeVmRow({ concerns: [infoConcern, criticalConcern], name: 'vm1' }),
      makeVmRow({
        concerns: [warningConcern, criticalConcern, { category: 'Warning', label: 'cpu' }],
        name: 'vm2',
      }),
      {
        folderName: 'f',
        isHidden: false as const,
        key: 'folder-f',
        treeRow: { onCollapse: jest.fn(), props: {}, rowIndex: 0 },
        type: ROW_TYPE.Folder,
      },
    ];

    // CPU vs cpu collapse case-insensitively; first-seen label/category win (Critical)
    expect(getConcernLabelFilterOptions(rows).map((option) => option.label)).toEqual([
      'CPU',
      'Disk',
      'NIC',
    ]);
  });

  it('builds unique hostname filter options sorted case-insensitively', () => {
    const rows = [
      makeVmRow({ host: 'esxi-b', name: 'vm1' }),
      makeVmRow({ host: 'esxi-a', name: 'vm2' }),
      makeVmRow({ host: 'ESXI-A', name: 'vm3' }),
    ];

    expect(getHostnameFilterOptions(rows).map((option) => option.label)).toEqual([
      'esxi-a',
      'esxi-b',
    ]);
  });

  it('returns empty filter options for empty rows', () => {
    expect(getConcernLabelFilterOptions([])).toEqual([]);
    expect(getHostnameFilterOptions([])).toEqual([]);
  });
});
