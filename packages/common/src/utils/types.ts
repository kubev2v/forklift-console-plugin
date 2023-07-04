export interface EnumGroup {
  groupId: string;
  label: string;
}

export interface EnumValue {
  id: string;
  groupId?: string;
  label: string;
}

export interface FilterDef {
  type: string;
  placeholderLabel: string;
  values?: EnumValue[];
  fieldLabel?: string;
  primary?: boolean;
  standalone?: boolean;
  groups?: EnumGroup[];
  // override default behavior if there are no filters provided by the user
  // by default missing/empty filters result in positive match (vacuous truth)
  defaultValues?: string[];
}

type OpenApiJsonPath = string | ((resourceData: unknown) => unknown);

export interface ResourceField {
  resourceFieldId: string;
  jsonPath?: OpenApiJsonPath;
  label: string;
  // visibility status, can change in time
  isVisible?: boolean;
  isIdentity?: boolean;
  isAction?: boolean;
  // if true then the field should be never visible in the UI
  isHidden?: boolean;
  sortable?: boolean;
  filter?: FilterDef;
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
