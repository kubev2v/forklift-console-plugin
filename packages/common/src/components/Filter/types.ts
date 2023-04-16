interface EnumGroup {
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

/**
 * Components implementing this interface may be added to complex filters.
 *
 * @see PrimaryFilters
 * @see AttributeValueFilter
 */
export interface FilterTypeProps {
  filterId: string;
  /**
   * Implementation of filter values is filter specific.
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
  /**
   * Language to be used for locale sensitive sorting/filtering. Defaults to 'en',
   */
  resolvedLanguage;
}

/**
 * Filter rendering component,
 *
 * Get the filter type, and render a top bar widget that match the filter.
 */
export type FilterRenderer = (props: FilterTypeProps) => JSX.Element;

/**
 * Field ID to filter definition mapping.
 */
export type FieldFilter = {
  resourceFieldId: string;
  label: string;
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
    [type: string]: FilterRenderer;
  };
  resolvedLanguage: string;
}

export interface GlobalFilters {
  [id: string]: string[];
}

export interface ValueMatcher {
  filterType: string;
  matchValue: (value: unknown) => (filter: string) => boolean;
}
