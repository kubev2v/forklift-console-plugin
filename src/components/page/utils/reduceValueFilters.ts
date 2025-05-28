import type { ValueMatcher } from '@components/common/FilterGroup/types';

/**
 * Reduce two list of filters to one list.
 *
 * @param extraFilters filters we want to use to add or override the default list
 * @param defaultFilters a default list of filters
 * @returns a list containing the default filters plus the extra ones, if an extra filter
 *          already exist in the default list, the extra filter will override the default one.
 */
export const reduceValueFilters = (
  extraFilters: ValueMatcher[],
  defaultFilters: ValueMatcher[],
): ValueMatcher[] => {
  const filters = [...extraFilters, ...defaultFilters].reduce<ValueMatcher[]>((acc, filter) => {
    const accFilterTypes = acc.map((matcher) => matcher.filterType);
    const filterTypeFound = accFilterTypes.includes(filter.filterType);

    if (!filterTypeFound) {
      acc.push(filter);
    }

    return acc;
  }, []);

  return filters;
};
