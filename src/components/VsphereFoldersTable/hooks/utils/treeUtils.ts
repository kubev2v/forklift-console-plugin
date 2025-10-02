import type { ReactNode } from 'react';
import { getVmPowerState } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/helpers/getVmPowerState';

import { getCategoryIcon } from '@components/Concerns/utils/category';
import {
  type ConcernCategory,
  ConcernCategoryOptions,
  severityRank,
  type VirtualMachineWithConcerns,
} from '@components/Concerns/utils/constants';
import type { CheckboxOption } from '@components/VsphereFoldersTable/components/AttributeFilter/utils/types';
import {
  COLUMN_IDS,
  ROW_TYPE,
  type RowNode,
  type SortState,
  type VmRow,
} from '@components/VsphereFoldersTable/utils/types';
import type { Concern, VSphereVM } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

type Counts = { Critical: number; Warning: number; Information: number };

export const getVmName = (row: VmRow) => row.vmData.name ?? '';
export const getVmHost = (row: VmRow) => row.vmData.hostName ?? '';
export const getVmPath = (row: VmRow) => (row.vmData.vm as VSphereVM)?.path ?? '';
export const getVmPower = (row: VmRow) => (getVmPowerState(row?.vmData?.vm) ?? '').toString();

export const getVmRowsId = (rows: RowNode[]) => {
  return rows
    .filter((row): row is VmRow => row.type === ROW_TYPE.Vm)
    .map((row) => row.vmData.vm.id);
};

export const getVmConcernCategories = (row: VmRow): ConcernCategory[] => {
  // Try the most likely locations first; adjust if your app stores concerns differently.
  const rawConcerns: Concern[] = (row.vmData.vm as VirtualMachineWithConcerns)?.concerns ?? [];

  if (!Array.isArray(rawConcerns)) return [];

  const out = new Set<ConcernCategory>();
  for (const concern of rawConcerns) {
    const category = concern?.category;
    if (
      category &&
      (category === ConcernCategoryOptions.Critical ||
        category === ConcernCategoryOptions.Warning ||
        category === ConcernCategoryOptions.Information)
    ) {
      out.add(category);
    }
  }
  return Array.from(out);
};

export const cmpStr = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

export const getFolderNameFromFolderRow = (row: RowNode) =>
  row.type === ROW_TYPE.Folder ? (row.folderName ?? '') : '';

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

const cmpCountsQuantityAsc = (first: Counts, second: Counts) => {
  // Desc by Critical, then Warning, then Information
  if (first.Critical !== second.Critical) return second.Critical - first.Critical;
  if (first.Warning !== second.Warning) return second.Warning - first.Warning;
  if (first.Information !== second.Information) return second.Information - first.Information;
  return 0;
};

export const buildVmComparator = (sort: SortState) => {
  const dir = sort.direction === 'asc' ? 1 : -1;
  switch (sort.column) {
    case COLUMN_IDS.Name:
      return (first: VmRow, second: VmRow) => dir * cmpStr(getVmName(first), getVmName(second));
    case COLUMN_IDS.Host:
      return (first: VmRow, second: VmRow) => dir * cmpStr(getVmHost(first), getVmHost(second));
    case COLUMN_IDS.Path:
      return (first: VmRow, second: VmRow) => dir * cmpStr(getVmPath(first), getVmPath(second));
    case COLUMN_IDS.Power:
      return (first: VmRow, second: VmRow) => dir * cmpStr(getVmPower(first), getVmPower(second));
    case COLUMN_IDS.Concerns:
      return (a: VmRow, b: VmRow) => {
        const ca = getConcernCounts(a);
        const cb = getConcernCounts(b);
        const base = cmpCountsQuantityAsc(ca, cb); // Critical↓, Warning↓, Info↓
        if (base !== 0) return base * dir; // apply direction
        // stable tiebreaker by name
        return cmpStr(getVmName(a), getVmName(b)) * dir;
      };
    default:
      return () => 0;
  }
};

export const getVmConcernLabels = (
  row: VmRow,
): {
  labels: string[];
  labelIconMapper: Record<string, ReactNode>;
  categoryMapper: Record<string, ConcernCategory>;
} => {
  const vm = row?.vmData?.vm as VirtualMachineWithConcerns | undefined;
  const concerns: Concern[] = vm?.concerns ?? [];
  if (!Array.isArray(concerns)) return { categoryMapper: {}, labelIconMapper: {}, labels: [] };

  const out = new Set<string>();
  const outIcons: Record<string, ReactNode> = {};
  const outCategories: Record<string, ConcernCategory> = {};
  for (const concern of concerns) {
    const raw = concern?.label ?? '';
    const label = raw.trim();
    if (!isEmpty(label)) {
      out.add(label);
      outIcons[label] = getCategoryIcon(concern.category);
      outCategories[label] = concern.category as ConcernCategory;
    }
  }
  return { categoryMapper: outCategories, labelIconMapper: outIcons, labels: Array.from(out) };
};

export const getConcernLabelFilterOptions = (rows: RowNode[]) => {
  const seen = new Map<string, string>();
  const iconMapper: Record<string, ReactNode> = {};
  const catMapper: Record<string, ConcernCategory> = {};
  for (const row of rows) {
    if (row.type === ROW_TYPE.Vm) {
      const { categoryMapper, labelIconMapper, labels } = getVmConcernLabels(row);
      for (const lbl of labels) {
        const key = lbl.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, lbl);
          iconMapper[lbl] = labelIconMapper[lbl];
          catMapper[lbl] = categoryMapper[lbl];
        }
      }
    }
  }

  const opts: CheckboxOption[] = Array.from(seen.values())
    .sort((first, second) => {
      const rankFirst = severityRank[catMapper[first]];
      const rankSecond = severityRank[catMapper[second]];

      return rankFirst - rankSecond;
    })
    .map((lbl) => ({ icon: iconMapper[lbl], id: lbl, label: lbl }));
  return opts;
};

export const getHostnameFilterOptions = (rows: RowNode[]) => {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.type === ROW_TYPE.Vm) {
      const hostname = getVmHost(row);
      const key = hostname.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, hostname);
      }
    }
  }

  const opts: CheckboxOption[] = Array.from(seen.values())
    .sort(cmpStr)
    .map((lbl) => ({ id: lbl, label: lbl }));
  return opts;
};
