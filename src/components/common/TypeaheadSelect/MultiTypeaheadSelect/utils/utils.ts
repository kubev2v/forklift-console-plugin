import type { TypeaheadSelectOption } from '../../utils/types';

export const createItemElementId = (value: string | number): string =>
  `select-multi-typeahead-${String(value).replace(/\s+/gu, '-')}`;

export const getPrevEnabledIndex = (
  options: TypeaheadSelectOption[],
  startIndex: number,
): number => {
  let index = startIndex;
  if (index < 0) index = options.length - 1;

  for (const option of options) {
    if (!option?.optionProps?.isDisabled) return index;
    index -= 1;
    if (index < 0) index = options.length - 1;
  }
  return startIndex;
};

export const getNextEnabledIndex = (
  options: TypeaheadSelectOption[],
  startIndex: number,
): number => {
  let index = startIndex;
  if (index >= options.length) index = 0;

  for (const option of options) {
    if (!option?.optionProps?.isDisabled) return index;
    index += 1;
    if (index >= options.length) index = 0;
  }
  return startIndex;
};
