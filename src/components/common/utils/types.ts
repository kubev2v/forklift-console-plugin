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
  icon?: ReactNode;
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
  dynamicFilter?: (items: unknown[]) => Partial<FilterDef>;
  isHidden?: boolean;
  showFilterIcon?: boolean;
};

type OpenApiJsonPath = string | string[] | ((resourceData: unknown) => string);

type OpenApiJsonResourcePath =
  | OpenApiJsonPath
  | ((
      resourceData: Record<
        string,
        object | string | boolean | ((resourceData: unknown) => unknown)
      >,
    ) => unknown);

export type ResourceField = {
  resourceFieldId: string | null;
  jsonPath?: OpenApiJsonResourcePath;
  label: string | null;
  // visibility status, can change in time
  isVisible?: boolean;
  isIdentity?: boolean;
  // if true,  it is used for adding another standalone filter to the same field.
  isForFilterOnly?: boolean;
  isAction?: boolean;
  // if true then the field should be never visible in the UI
  isHidden?: boolean;
  sortable?: boolean;
  filter?: FilterDef | null;
  // if true then the field filters state should persist between sessions
  isPersistent?: boolean;
  info?: ThProps['info'];
  compareFn?: (a: string, b: string, locale: string) => number;
  defaultSortDirection?: SortDirection;
  // data-testid for the column header (for e2e testing)
  testId?: string;
  // column width as a percentage (PatternFly Th width prop)
  width?: 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80 | 90 | 100;
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
