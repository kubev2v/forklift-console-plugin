import { FilterDef } from './Filter/types';

type OpenAPIjsonPath = string | ((entity: unknown) => unknown);

export interface SortType {
  isAsc: boolean;
  id: string;
  toLabel(t: (key: string) => string): string;
}

export interface Field {
  id: string;
  jsonPath?: OpenAPIjsonPath;
  toLabel(t: (key: string) => string): string;
  // visiblity status, can change in time
  isVisible?: boolean;
  isIdentity?: boolean;
  isAction?: boolean;
  // if true then the field should be never visible in the UI
  isHidden?: boolean;
  sortable?: boolean;
  filter?: FilterDef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comparator?: (a: any, b: any, locale: string) => number;
}

export const K8sConditionStatusValues = ['True', 'False', 'Unknown'] as const;
export type K8sConditionStatus = (typeof K8sConditionStatusValues)[number];
