import type { ReactNode } from 'react';

import type { SelectOptionProps } from '@patternfly/react-core';
import type { ThProps } from '@patternfly/react-table';

export type EnumGroup = {
  groupId: string;
  label: string;
};

export type EnumValue = {
  groupId?: string;
  icon?: ReactNode;
  id: string;
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
  // override default behavior if there are no filters provided by the user
  // by default missing/empty filters result in positive match (vacuous truth)
  defaultValues?: string[];
  dynamicFilter?: (items: unknown[]) => Partial<FilterDef>;
  excludeFromClearFilters?: boolean;
  fieldLabel?: string;
  groups?: EnumGroup[];
  helperText?: string | ReactNode;
  isHidden?: boolean;
  placeholderLabel?: string;
  primary?: boolean;
  showFilterIcon?: boolean;
  standalone?: boolean;
  type: string;
  values?: EnumValue[];
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
  compareFn?: (a: string, b: string, locale: string) => number;
  defaultSortDirection?: SortDirection;
  filter?: FilterDef | null;
  info?: ThProps['info'];
  isAction?: boolean;
  // if true,  it is used for adding another standalone filter to the same field.
  isForFilterOnly?: boolean;
  // if true then the field should be never visible in the UI
  isHidden?: boolean;
  isIdentity?: boolean;
  // if true then the field filters state should persist between sessions
  isPersistent?: boolean;
  // visibility status, can change in time
  isVisible?: boolean;
  jsonPath?: OpenApiJsonResourcePath;
  label: string | null;
  resourceFieldId: string | null;
  sortable?: boolean;
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
