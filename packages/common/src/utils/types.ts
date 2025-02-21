import React from 'react';

import { SelectOptionObject } from '@patternfly/react-core/deprecated';
export interface EnumGroup {
  groupId: string;
  label: string;
}

export interface EnumValue {
  id: string;
  groupId?: string;
  label: string;
  resourceFieldId?: string;
}

export interface FilterDef {
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
  helperText?: string | React.ReactNode;
  dynamicFilter?: (items: unknown[]) => Partial<FilterDef>;
  isHidden?: boolean;
  showFilterIcon?: boolean;
}

type OpenApiJsonPath = string | ((resourceData: unknown) => unknown);

export interface ResourceField {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compareFn?: (a: any, b: any, locale: string) => number;
}

export type ResourceFieldPartialFactory = { (t: (string) => string): Partial<ResourceField> };
export type ResourceFieldFactory = { (t: (string) => string): ResourceField[] };

export const K8sConditionStatusValues = ['True', 'False', 'Unknown'] as const;
export type K8sConditionStatus = (typeof K8sConditionStatusValues)[number];

export interface GlobalActionToolbarProps<T> {
  // data currently visible on the screen (i.e. adjusted by paging and filtering)
  dataOnScreen: T[];
}

/**
 * @typedef {Object} ToggleEventType
 * @description Represents the possible event types that can be used for toggling actions.
 *
 * @property {Event} Event - A standard DOM event.
 * @property {React.KeyboardEvent<Element>} React.KeyboardEvent - A React-specific keyboard event.
 * @property {React.MouseEvent<Element, MouseEvent>} React.MouseEvent - A React-specific mouse event.
 * @property {React.ChangeEvent<Element>} React.ChangeEvent - A React-specific change event.
 */
export type ToggleEventType =
  | Event
  | React.KeyboardEvent<Element>
  | React.MouseEvent<Element, MouseEvent>
  | React.ChangeEvent<Element>;

/**
 * @typedef {Object} SelectEventType
 * @description Represents the possible event types that can be used for select actions.
 *
 * @property {React.MouseEvent<Element, MouseEvent>} React.MouseEvent - A React-specific mouse event.
 * @property {React.ChangeEvent<Element>} React.ChangeEvent - A React-specific change event.
 */
export type SelectEventType = React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>;

/**
 * @typedef {Object} SelectValueType
 * @description Represents the possible value types that can be used for select actions.
 *
 * @property {string} string .
 * @property {SelectOptionObject} SelectOptionObject
 */
export type SelectValueType = string | SelectOptionObject;
