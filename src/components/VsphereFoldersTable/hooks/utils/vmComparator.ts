import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import {
  COLUMN_IDS,
  type SortState,
  type VmRow,
} from '@components/VsphereFoldersTable/utils/types';
import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

import {
  cmpStr,
  getVmGuestOSValue,
  getVmHost,
  getVmName,
  getVmPath,
  getVmPower,
} from './vmRowAccessors';

const INSPECTION_STATUS_SEVERITY_RANK: Record<InspectionStatus, number> = {
  [INSPECTION_STATUS.CANCELED]: 6,
  [INSPECTION_STATUS.FAILED]: 1,
  [INSPECTION_STATUS.INSPECTION_PASSED]: 5,
  [INSPECTION_STATUS.ISSUES_FOUND]: 0,
  [INSPECTION_STATUS.NOT_INSPECTED]: 4,
  [INSPECTION_STATUS.PENDING]: 3,
  [INSPECTION_STATUS.RUNNING]: 2,
};

type Counts = { Critical: number; Information: number; Warning: number };

const getConcernCounts = (row: VmRow): Counts => {
  const concerns = (row.vmData.vm as VirtualMachineWithConcerns)?.concerns ?? [];
  const counts: Counts = { Critical: 0, Information: 0, Warning: 0 };
  for (const concern of concerns) {
    const category = concern?.category;
    if (category === 'Critical' || category === 'Warning' || category === 'Information') {
      counts[category] += 1;
    }
  }
  return counts;
};

const cmpCountsQuantityAsc = (first: Counts, second: Counts): number => {
  if (first.Critical !== second.Critical) {
    return second.Critical - first.Critical;
  }
  if (first.Warning !== second.Warning) {
    return second.Warning - first.Warning;
  }
  if (first.Information !== second.Information) {
    return second.Information - first.Information;
  }
  return 0;
};

type GetVmInspectionStatusFn = (vmId: string) => VmInspectionStatus | undefined;

type VmComparator = (first: VmRow, second: VmRow) => number;

export const buildVmComparator = (
  sort: SortState,
  getVmInspectionStatus?: GetVmInspectionStatusFn,
): VmComparator => {
  const dir = sort.direction === 'asc' ? 1 : -1;
  switch (sort.column) {
    case COLUMN_IDS.Name:
      return (first: VmRow, second: VmRow): number =>
        dir * cmpStr(getVmName(first), getVmName(second));
    case COLUMN_IDS.GuestOS:
      return (first: VmRow, second: VmRow): number =>
        dir * cmpStr(getVmGuestOSValue(first), getVmGuestOSValue(second));
    case COLUMN_IDS.Host:
      return (first: VmRow, second: VmRow): number =>
        dir * cmpStr(getVmHost(first), getVmHost(second));
    case COLUMN_IDS.Path:
      return (first: VmRow, second: VmRow): number =>
        dir * cmpStr(getVmPath(first), getVmPath(second));
    case COLUMN_IDS.Power:
      return (first: VmRow, second: VmRow): number =>
        dir * cmpStr(getVmPower(first), getVmPower(second));
    case COLUMN_IDS.Concerns:
      return (a: VmRow, b: VmRow): number => {
        const ca = getConcernCounts(a);
        const cb = getConcernCounts(b);
        const base = cmpCountsQuantityAsc(ca, cb);
        if (base !== 0) {
          return base * dir;
        }
        return cmpStr(getVmName(a), getVmName(b)) * dir;
      };
    case COLUMN_IDS.InspectionStatus:
      return (first: VmRow, second: VmRow): number => {
        const statusA =
          getVmInspectionStatus?.(first.vmData.vm?.id ?? '')?.status ??
          INSPECTION_STATUS.NOT_INSPECTED;
        const statusB =
          getVmInspectionStatus?.(second.vmData.vm?.id ?? '')?.status ??
          INSPECTION_STATUS.NOT_INSPECTED;
        const rankDiff =
          INSPECTION_STATUS_SEVERITY_RANK[statusA] - INSPECTION_STATUS_SEVERITY_RANK[statusB];
        if (rankDiff !== 0) {
          return rankDiff * dir;
        }
        return cmpStr(getVmName(first), getVmName(second)) * dir;
      };
    default:
      return (): number => 0;
  }
};
