import { FilterDef } from '../../utils';
import { FilterTypeProps } from '../Filter';

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
