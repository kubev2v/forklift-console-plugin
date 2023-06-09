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
