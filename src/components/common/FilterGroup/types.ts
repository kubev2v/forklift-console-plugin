import type { FilterTypeProps } from '../Filter';
import type { FilterDef } from '../utils';

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

export type MetaFilterProps = {
  /**
   * List of the selected values for the filter.
   * Field-to-filter values mapping where:
   * 1) key: ID of the field that the filter should apply to.
   * 2) value: a string array with filter-specific interpretation.
   * i.e. { NAME: ["foo", "bar"]}
   */
  selectedFilters: GlobalFilters;

  /**
   * List of filters included in this filter group
   * and for each filter, list of its supported values and groups (if limited)
   */
  fieldFilters: FieldFilter[];

  /**
   * Filter apply handler.
   * Implementation of filter values is filter specific.
   * @param values list of selected filter values
   */
  onFilterUpdate: (filters: GlobalFilters) => void;

  /**
   * The supported filter types that will be included in this filter group
   * (e.g. EnumFilter, FreetextFilter, GroupedEnumFilter, SwitchFilter)
   */
  supportedFilterTypes: Record<string, FilterRenderer>;
  /**
   * Language to be used for locale sensitive sorting/filtering. Defaults to 'en'.
   */
  resolvedLanguage?: string;
};

export type GlobalFilters = Record<string, string[]>;

export type ValueMatcher = {
  filterType: string;
  matchValue: (value: unknown) => (filter: string) => boolean;
};
