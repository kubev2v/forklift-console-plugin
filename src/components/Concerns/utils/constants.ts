import type { OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@forklift-ui/types';

export const ConcernCategoryOptions = {
  Advisory: 'Advisory',
  Critical: 'Critical',
  Error: 'Error',
  Information: 'Information',
  Warn: 'Warn',
  Warning: 'Warning',
} as const;

export type ConcernCategory = (typeof ConcernCategoryOptions)[keyof typeof ConcernCategoryOptions];

export const orderedConcernCategories: ConcernCategory[] = [
  ConcernCategoryOptions.Critical,
  ConcernCategoryOptions.Error,
  ConcernCategoryOptions.Warning,
  ConcernCategoryOptions.Information,
  ConcernCategoryOptions.Advisory,
];

export type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

export const severityRank: Record<ConcernCategory, number> = {
  [ConcernCategoryOptions.Advisory]: 3,
  [ConcernCategoryOptions.Critical]: 0,
  [ConcernCategoryOptions.Error]: 0,
  [ConcernCategoryOptions.Information]: 3,
  [ConcernCategoryOptions.Warn]: 1,
  [ConcernCategoryOptions.Warning]: 1,
};
