import { COLUMN_IDS } from '@components/VsphereFoldersTable/utils/types';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

import { buildVmComparator } from '../vmComparator';

import { criticalConcern, infoConcern, makeVmRow, warningConcern } from './fixtures';

describe('buildVmComparator', () => {
  const a = makeVmRow({
    guestName: 'Linux',
    host: 'h1',
    name: 'alpha',
    path: '/a',
    powerState: 'poweredOn',
  });
  const b = makeVmRow({
    guestName: 'Windows',
    host: 'h2',
    name: 'bravo',
    path: '/b',
    powerState: 'poweredOff',
  });

  it.each([
    [COLUMN_IDS.Name, 'asc', -1],
    [COLUMN_IDS.Name, 'desc', 1],
    [COLUMN_IDS.GuestOS, 'asc', -1],
    [COLUMN_IDS.Host, 'asc', -1],
    [COLUMN_IDS.Path, 'asc', -1],
    [COLUMN_IDS.Power, 'asc', 1],
  ] as const)('sorts by %s %s', (column, direction, expectedSign) => {
    const cmp = buildVmComparator({ column, direction });
    expect(Math.sign(cmp(a, b))).toBe(expectedSign);
  });

  it('sorts concerns by Critical then Warning then Information quantity', () => {
    const criticalHeavy = makeVmRow({
      concerns: [criticalConcern, criticalConcern, warningConcern],
      name: 'c',
    });
    const warningHeavy = makeVmRow({
      concerns: [warningConcern, warningConcern, infoConcern],
      name: 'w',
    });
    const cmpAsc = buildVmComparator({ column: COLUMN_IDS.Concerns, direction: 'asc' });
    expect(cmpAsc(criticalHeavy, warningHeavy)).toBeLessThan(0);

    const cmpDesc = buildVmComparator({ column: COLUMN_IDS.Concerns, direction: 'desc' });
    expect(cmpDesc(criticalHeavy, warningHeavy)).toBeGreaterThan(0);
  });

  it('uses name as tiebreaker for equal concern counts', () => {
    const first = makeVmRow({ concerns: [warningConcern], name: 'a' });
    const second = makeVmRow({ concerns: [warningConcern], name: 'b' });
    const cmp = buildVmComparator({ column: COLUMN_IDS.Concerns, direction: 'asc' });
    expect(cmp(first, second)).toBeLessThan(0);
  });

  it('sorts inspection status by severity rank with name tiebreaker', () => {
    const issues = makeVmRow({ name: 'z-issues' });
    const passed = makeVmRow({ name: 'a-passed' });
    const getStatus = (vmId: string): VmInspectionStatus | undefined => {
      if (vmId === 'z-issues') {
        return { status: INSPECTION_STATUS.ISSUES_FOUND } as VmInspectionStatus;
      }
      if (vmId === 'a-passed') {
        return { status: INSPECTION_STATUS.INSPECTION_PASSED } as VmInspectionStatus;
      }
      return undefined;
    };

    const cmpAsc = buildVmComparator(
      { column: COLUMN_IDS.InspectionStatus, direction: 'asc' },
      getStatus,
    );
    expect(cmpAsc(issues, passed)).toBeLessThan(0);
    expect(cmpAsc(makeVmRow({ name: 'a' }), makeVmRow({ name: 'b' }))).toBeLessThan(0);
  });

  it('defaults missing inspection status to Not inspected', () => {
    const withExplicit = makeVmRow({ name: 'tie' });
    const withMissing = makeVmRow({ name: 'tie' });
    (withExplicit.vmData.vm as { id: string }).id = 'explicit';
    (withMissing.vmData.vm as { id: string }).id = 'missing';
    const passed = makeVmRow({ name: 'passed' });
    const getStatus = (vmId: string): VmInspectionStatus | undefined => {
      if (vmId === 'explicit') {
        return { status: INSPECTION_STATUS.NOT_INSPECTED } as VmInspectionStatus;
      }
      if (vmId === 'passed') {
        return { status: INSPECTION_STATUS.INSPECTION_PASSED } as VmInspectionStatus;
      }
      return undefined;
    };
    const cmp = buildVmComparator(
      { column: COLUMN_IDS.InspectionStatus, direction: 'asc' },
      getStatus,
    );
    expect(cmp(withExplicit, withMissing)).toBe(0);
    expect(cmp(withMissing, passed)).toBeLessThan(0);
  });

  it('returns zero comparator for unknown columns', () => {
    const cmp = buildVmComparator({ column: 'unknown' as never, direction: 'asc' });
    expect(cmp(a, b)).toBe(0);
  });

  it('sorts names case-insensitively', () => {
    const upper = makeVmRow({ name: 'Alpha' });
    const lower = makeVmRow({ name: 'alpha' });
    const cmp = buildVmComparator({ column: COLUMN_IDS.Name, direction: 'asc' });
    expect(cmp(upper, lower)).toBe(0);
  });
});
