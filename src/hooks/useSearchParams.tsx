import * as React from 'react';

export type MappedSearchParams = Record<string, string>;

export type SetURLSearchParams = (params: MappedSearchParams) => void;

/**
 * Take a url string and convert it to a search params map.  If a key occurs multiple
 * times, the key's last values wins.
 *
 * @param {string} search params url string
 * @returns {{}} a key:value map of the search params
 */
export const toMap = (search: string): MappedSearchParams => {
  return Object.fromEntries(new URLSearchParams(search).entries());
};

/**
 * A hook to get and set the URL search params.
 *
 * @returns the URL search params as a key:value map, and a URL
 *          search params setter method
 */
export const useSearchParams = (): [MappedSearchParams, SetURLSearchParams] => {
  const [searchParams, internalSetSearchParams] = React.useState(toMap(location.search));

  /**
   * Update and add to the existing search parameters on the URL and the internal state.
   *
   * @param {MappedSearchParams} params
   */
  const updateSearchParams: SetURLSearchParams = (params) => {
    const combinedPrams = { ...searchParams, ...params };
    const urlSearchParams = new URLSearchParams(combinedPrams);
    history.pushState({}, '', location.pathname + '?' + urlSearchParams.toString());

    // Update search params state
    internalSetSearchParams(combinedPrams);
  };

  return [searchParams, updateSearchParams];
};
