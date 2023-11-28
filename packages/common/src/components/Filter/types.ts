import { EnumGroup, EnumValue } from '../../utils';

/**
 * Components implementing this interface may be added to complex filters.
 *
 * @see PrimaryFilters
 * @see AttributeValueFilter
 */
export interface FilterTypeProps {
  filterId: string;
  /**
   * Filter apply handler. Implementation of filter values is filter specific.
   * @param values list of selected filter values
   */
  onFilterUpdate(values: string[]);
  /**
   * A text located inside the filter field or next to it.
   */
  placeholderLabel?: string;
  /**
   * List of selected values for the filter (filter specific).
   */
  selectedFilters?: string[];
  /**
   * Display or hide the filter component.
   */
  showFilter?: boolean;
  /**
   * A title for the category appears in filter chips.
   */
  title?: string;
  /**
   * List of filter supported values (if limited)
   */
  supportedValues?: EnumValue[];
  /**
   * groups for supported values (if exists or required by a specific filter)
   */
  supportedGroups: EnumGroup[];
  /**
   * Language to be used for locale sensitive sorting/filtering. Defaults to 'en'.
   */
  resolvedLanguage: string;
  /** Text that explains how to use the filter. */
  helperText?: string | React.ReactNode;
}

export interface InlineFilter {
  hasInlineFilter?: boolean;
}
