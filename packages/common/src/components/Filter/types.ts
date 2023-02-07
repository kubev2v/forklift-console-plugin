interface EnumGroup {
  groupId: string;
  toLabel(t: (key: string) => string): string;
}

export interface EnumValue {
  id: string;
  groupId?: string;
  toLabel(t: (key: string) => string): string;
}

export interface FilterDef {
  type: string;
  toPlaceholderLabel(t: (key: string) => string): string;
  values?: EnumValue[];
  toLabel?(t: (key: string) => string): string;
  primary?: boolean;
  groups?: EnumGroup[];
}

/**
 * Components implmeneting this interface may be added to complex filters.
 *
 * @see PrimaryFilters
 * @see AttributeValueFilter
 */
export interface FilterTypeProps {
  filterId: string;
  /**
   * Interpration of filter values is filter specific.
   * @param values list of selected filter values
   */
  onFilterUpdate(values: string[]);
  placeholderLabel: string;
  /**
   * List of selected values (filter specific).
   */
  selectedFilters: string[];
  showFilter: boolean;
  title: string;
  /**
   * (Optional) List of supported values (if limited)
   */
  supportedValues?: EnumValue[];
  /**
   * (Optional) groups for supported values (if exist)
   */
  supportedGroups?: EnumGroup[];
}

/**
 * Field ID to filter defintion mapping.
 */
export type FieldFilter = {
  fieldId: string;
  toFieldLabel(t: (key: string) => string): string;
  filterDef: FilterDef;
};

export interface MetaFilterProps {
  /**
   * Field-to-filter values mapping where:
   * 1) key: ID of the field that the filter should apply to.
   * 2) value: a string array with filter-specific interpretation.
   * i.e. { NAME: ["foo", "bar"]}
   */
  selectedFilters: GlobalFilters;
  fieldFilters: FieldFilter[];
  onFilterUpdate(filters: GlobalFilters): void;
  supportedFilterTypes: {
    [type: string]: (props: FilterTypeProps) => JSX.Element;
  };
}

export interface GlobalFilters {
  [id: string]: string[];
}

export interface ValueMatcher {
  filterType: string;
  matchValue: (value: unknown) => (filter: string) => boolean;
}
