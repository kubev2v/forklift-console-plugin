import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { PLACEHOLDER_VALUES } from './constants';
import type { FilterOptionsConfig, TypeaheadSelectOption } from './types';

/**
 * Creates a "create new option" item for the dropdown
 */
const createNewOption = (
  inputValue: string,
  createMessage: string | ((value: string) => string),
): TypeaheadSelectOption => ({
  content: typeof createMessage === 'function' ? createMessage(inputValue) : createMessage,
  optionProps: {
    className: 'pf-m-action',
    'data-testid': 'multi-typeahead-select-create-option',
  },
  value: inputValue,
});

/**
 * Creates a disabled "no results found" option
 */
const createNoResultsOption = (
  inputValue: string,
  noResultsMessage: string | ((filter: string) => string),
): TypeaheadSelectOption => ({
  content: typeof noResultsMessage === 'function' ? noResultsMessage(inputValue) : noResultsMessage,
  optionProps: { isDisabled: true },
  value: PLACEHOLDER_VALUES.NO_RESULTS,
});

/**
 * Checks if a create option should be added to the filtered results
 */
const shouldAddCreateOption = (
  inputValue: string,
  filteredOptions: TypeaheadSelectOption[],
  isCreatable: boolean,
): boolean =>
  isCreatable &&
  Boolean(inputValue.trim()) &&
  !filteredOptions?.some(
    (option) => String(option.content).toLowerCase() === inputValue.toLowerCase(),
  );

/**
 * Default filter function that performs case-insensitive substring matching
 */
export const defaultFilterFunction = (
  filterValue: string,
  options: TypeaheadSelectOption[],
): TypeaheadSelectOption[] =>
  options?.filter((option) =>
    String(option.content).toLowerCase().includes(filterValue.toLowerCase()),
  ) ?? [];

/**
 * Checks if a value is a placeholder value that should not trigger selection
 */
export const isPlaceholderValue = (value: string | number | undefined): boolean =>
  value === PLACEHOLDER_VALUES.NO_RESULTS || value === PLACEHOLDER_VALUES.NO_OPTIONS;

/**
 * Generates filtered options based on input value and filtering state
 */
export const generateFilteredOptions = (config: FilterOptionsConfig): TypeaheadSelectOption[] => {
  const {
    createOptionMessage,
    filterFunction,
    inputValue,
    isCreatable,
    isFiltering,
    noResultsMessage,
    options,
  } = config;

  // Return all options if not filtering
  if (!isFiltering || !inputValue.trim()) {
    return options;
  }

  let filtered = filterFunction(inputValue, options);

  // Add create option if applicable
  if (shouldAddCreateOption(inputValue, filtered, isCreatable)) {
    filtered = [createNewOption(inputValue, createOptionMessage), ...filtered];
  }

  // Return no results option if no matches found
  return isEmpty(filtered) ? [createNoResultsOption(inputValue, noResultsMessage)] : filtered;
};

export const getDefaultCreateMessage = (value: string): string => t(`Create "${value}"`);

export const getDefaultNoResults = (filter: string): string =>
  t(`No results found for "${filter}"`);
