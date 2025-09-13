import type { OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';

export const ConcernCategoryOptions = {
  Critical: 'Critical',
  Information: 'Information',
  Warning: 'Warning',
} as const;

export type ConcernCategory = (typeof ConcernCategoryOptions)[keyof typeof ConcernCategoryOptions];

export const orderedConcernCategories: ConcernCategory[] = [
  ConcernCategoryOptions.Critical,
  ConcernCategoryOptions.Warning,
  ConcernCategoryOptions.Information,
];

export type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

export const severityRank: Record<ConcernCategory, number> = {
  [ConcernCategoryOptions.Critical]: 0,
  [ConcernCategoryOptions.Information]: 2,
  [ConcernCategoryOptions.Warning]: 1,
};
