import type { ReactNode } from 'react';

import { getCategoryIcon } from '@components/Concerns/utils/category';
import {
  type ConcernCategory,
  ConcernCategoryOptions,
  severityRank,
  type VirtualMachineWithConcerns,
} from '@components/Concerns/utils/constants';
import type { CheckboxOption } from '@components/VsphereFoldersTable/components/AttributeFilter/utils/types';
import { ROW_TYPE, type RowNode, type VmRow } from '@components/VsphereFoldersTable/utils/types';
import type { Concern, VSphereVM } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { getVmPowerState } from '@utils/virtual-machines/getVmPowerState';
import { getVmGuestOS } from '@utils/vm/getVmGuestOS';

export const getVmName = (row: VmRow): string => row.vmData.name ?? '';
export const getVmGuestOSValue = (row: VmRow): string => getVmGuestOS(row.vmData.vm);
export const getVmHost = (row: VmRow): string => row.vmData.hostName ?? '';
export const getVmPath = (row: VmRow): string => (row.vmData.vm as VSphereVM)?.path ?? '';
export const getVmPower = (row: VmRow): string => getVmPowerState(row?.vmData?.vm) ?? '';

export const getVmRowsId = (rows: RowNode[]): string[] => {
  return rows
    .filter((row): row is VmRow => row.type === ROW_TYPE.Vm)
    .map((row) => row.vmData.vm.id);
};

export const getVmConcernCategories = (row: VmRow): ConcernCategory[] => {
  const rawConcerns: Concern[] = (row.vmData.vm as VirtualMachineWithConcerns)?.concerns ?? [];

  if (!Array.isArray(rawConcerns)) {
    return [];
  }

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

export const cmpStr = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

export const getFolderNameFromFolderRow = (row: RowNode): string =>
  row.type === ROW_TYPE.Folder ? (row.folderName ?? '') : '';

export const getVmConcernLabels = (
  row: VmRow,
): {
  categoryMapper: Record<string, ConcernCategory>;
  labelIconMapper: Record<string, ReactNode>;
  labels: string[];
} => {
  const vm = row?.vmData?.vm as VirtualMachineWithConcerns | undefined;
  const concerns: Concern[] = vm?.concerns ?? [];
  if (!Array.isArray(concerns)) {
    return { categoryMapper: {}, labelIconMapper: {}, labels: [] };
  }

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

export const getConcernLabelFilterOptions = (rows: RowNode[]): CheckboxOption[] => {
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

export const getHostnameFilterOptions = (rows: RowNode[]): CheckboxOption[] => {
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
