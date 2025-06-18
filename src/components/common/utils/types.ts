import type { ReactNode } from 'react';

import type { SelectOptionObject } from '@patternfly/react-core/deprecated';
import type { ThInfoType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

export type EnumGroup = {
  groupId: string;
  label: string;
};

export type EnumValue = {
  id: string;
  groupId?: string;
  label: string;
  resourceFieldId?: string;
};

export enum FilterDefType {
  FreeText = 'freetext',
  Enum = 'enum',
  GroupedEnum = 'groupedEnum',
  DateRange = 'dateRange',
  Slider = 'slider',
}

export type FilterDef = {
  type: string;
  placeholderLabel?: string;
  values?: EnumValue[];
  fieldLabel?: string;
  primary?: boolean;
  standalone?: boolean;
  groups?: EnumGroup[];
  // override default behavior if there are no filters provided by the user
  // by default missing/empty filters result in positive match (vacuous truth)
  defaultValues?: string[];
  helperText?: string | ReactNode;
  dynamicFilter?: (items: never[]) => Partial<FilterDef>;
  isHidden?: boolean;
  showFilterIcon?: boolean;
};

type OpenApiJsonPath = string | ((resourceData: never) => unknown);

export type ResourceField = {
  resourceFieldId: string | null;
  jsonPath?: OpenApiJsonPath;
  label: string | null;
  // visibility status, can change in time
  isVisible?: boolean;
  isIdentity?: boolean;
  isAction?: boolean;
  // if true then the field should be never visible in the UI
  isHidden?: boolean;
  sortable?: boolean;
  filter?: FilterDef;
  // if true then the field filters state should persist between sessions
  isPersistent?: boolean;
  info?: ThInfoType;
  compareFn?: (a: string, b: string, locale: string) => number;
  defaultSortDirection?: SortDirection;
};

export type GlobalActionToolbarProps<T> = {
  // data currently visible on the screen (i.e. adjusted by paging and filtering)
  dataOnScreen: T[];
  selectedIds?: string[];
};

/**
 * @typedef {Object} SelectValueType
 * @description Represents the possible value types that can be used for select actions.
 *
 * @property {string} string .
 * @property {SelectOptionObject} SelectOptionObject
 */
export type SelectValueType = string | SelectOptionObject;

export type SortDirection = 'asc' | 'desc';
