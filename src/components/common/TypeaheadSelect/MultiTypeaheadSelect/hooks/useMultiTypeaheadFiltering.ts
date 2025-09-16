import { useMemo } from 'react';

import { isEmpty } from '@utils/helpers';

import { DEFAULT_NO_OPTIONS, PLACEHOLDER_VALUES } from '../../utils/constants';
import type { TypeaheadSelectOption } from '../../utils/types';
import {
  defaultFilterFunction,
  generateFilteredOptions,
  getDefaultCreateMessage,
  getDefaultNoResults,
} from '../../utils/utils';

type UseMultiTypeaheadFilteringArgs = {
  options: TypeaheadSelectOption[];
  values: (string | number)[];
  isCreatable?: boolean;
  isFiltering: boolean;
  inputValue: string;
  filterFunction?: (filterValue: string, opts: TypeaheadSelectOption[]) => TypeaheadSelectOption[];
  createOptionMessage?: string | ((value: string) => string);
  noResultsMessage?: string | ((filter: string) => string);
  noOptionsMessage?: string;
};

type UseMultiTypeaheadFilteringReturn = {
  selectedOptions: TypeaheadSelectOption[];
  displayOptions: TypeaheadSelectOption[];
};

export const useMultiTypeaheadFiltering = ({
  createOptionMessage = getDefaultCreateMessage,
  filterFunction = defaultFilterFunction,
  inputValue,
  isCreatable = false,
  isFiltering,
  noOptionsMessage = DEFAULT_NO_OPTIONS,
  noResultsMessage = getDefaultNoResults,
  options,
  values,
}: UseMultiTypeaheadFilteringArgs): UseMultiTypeaheadFilteringReturn => {
  const selectedOptions = useMemo(() => {
    const optionByValue = new Map(options.map((opt) => [opt.value, opt]));
    return values.map<TypeaheadSelectOption>((val) => {
      const existing = optionByValue.get(val);
      return existing ?? { content: String(val), value: val };
    });
  }, [options, values]);

  const filteredOptions = useMemo(
    () =>
      generateFilteredOptions({
        createOptionMessage,
        filterFunction,
        inputValue,
        isCreatable,
        isFiltering,
        noResultsMessage,
        options,
      }),
    [
      createOptionMessage,
      filterFunction,
      inputValue,
      isCreatable,
      isFiltering,
      noResultsMessage,
      options,
    ],
  );

  const displayOptions = useMemo(() => {
    if (isFiltering) return filteredOptions;
    if (isEmpty(options)) {
      return [
        {
          content: noOptionsMessage,
          optionProps: { isDisabled: true },
          value: PLACEHOLDER_VALUES.NO_OPTIONS,
        },
      ];
    }
    return filteredOptions;
  }, [filteredOptions, isFiltering, noOptionsMessage, options]);

  return { displayOptions, selectedOptions };
};
