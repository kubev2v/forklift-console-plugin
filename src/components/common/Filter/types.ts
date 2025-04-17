import type { ReactNode } from 'react';

import type { EnumGroup, EnumValue } from '../utils/types';

/**
 * Components implementing this interface may be added to complex filters.
 *
 * @see PrimaryFilters
 * @see AttributeValueFilter
 */
export type FilterTypeProps = {
  filterId: string;
  /**
   * Filter apply handler. Implementation of filter values is filter specific.
   * @param values list of selected filter values
   */
  onFilterUpdate: (values: string[], resourceFieldId?: string) => unknown;
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
  helperText?: string | ReactNode;
  /** Toggles visibility of FilterIcon within the Select input field. */
  showFilterIcon?: boolean;
  /** Used for grouped enum filters that deal with groups pointing to different resources. */
  hasMultipleResources?: boolean;
};
