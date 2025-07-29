import type { ReactNode } from 'react';

import type { SelectOptionProps } from '@patternfly/react-core';
import type { ThProps } from '@patternfly/react-table';

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
  excludeFromClearFilters?: boolean;
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
  info?: ThProps['info'];
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
 * Must have a toString() method for compatibility with existing select handlers.
 */
export type SelectValueType =
  | string
  | (Pick<SelectOptionProps, 'value' | 'isDisabled' | 'children'> & {
      toString: () => string;
    });

export type SortDirection = 'asc' | 'desc';
