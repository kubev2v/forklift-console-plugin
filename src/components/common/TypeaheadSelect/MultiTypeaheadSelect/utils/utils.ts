import { isEmpty } from '@utils/helpers';

import type { TypeaheadSelectOption } from '../../utils/types';

export const createItemElementId = (value: string | number): string =>
  `select-multi-typeahead-${String(value).replace(/\s+/gu, '-')}`;

export const getPrevEnabledIndex = (
  options: TypeaheadSelectOption[],
  startIndex: number,
): number => {
  if (isEmpty(options)) {
    return startIndex;
  }

  let index = startIndex;
  if (index < 0) {
    index = options.length - 1;
  }

  for (let step = 0; step < options.length; step += 1) {
    if (!options[index]?.optionProps?.isDisabled) {
      return index;
    }
    index -= 1;
    if (index < 0) {
      index = options.length - 1;
    }
  }
  return startIndex;
};

export const getNextEnabledIndex = (
  options: TypeaheadSelectOption[],
  startIndex: number,
): number => {
  if (isEmpty(options)) {
    return startIndex;
  }

  let index = startIndex;
  if (index >= options.length) {
    index = 0;
  }

  for (let step = 0; step < options.length; step += 1) {
    if (!options[index]?.optionProps?.isDisabled) {
      return index;
    }
    index += 1;
    if (index >= options.length) {
      index = 0;
    }
  }
  return startIndex;
};
