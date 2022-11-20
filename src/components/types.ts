import { FilterDef } from './Filter/types';

export interface SortType {
  isAsc: boolean;
  id: string;
  toLabel(t: (key: string) => string): string;
}

export interface Field {
  id: string;
  toLabel(t: (key: string) => string): string;
  isVisible?: boolean;
  isIdentity?: boolean;
  sortable?: boolean;
  filter?: FilterDef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comparator?: (a: any, b: any, locale: string) => number;
}

export const K8sConditionStatusValues = ['True', 'False', 'Unknown'] as const;
export type K8sConditionStatus = typeof K8sConditionStatusValues[number];
