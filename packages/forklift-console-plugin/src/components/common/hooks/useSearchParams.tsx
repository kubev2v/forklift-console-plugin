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

  const removeUndefinedKeys = (obj: { [k: string]: string }): { [k: string]: string } =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

  /**
   * Merge new search parameter into existing parameters. Any key with an undefined value will be removed from the existing params.
   *
   * @param {MappedSearchParams} params
   */
  const updateSearchParams: SetURLSearchParams = (params) => {
    const combinedPrams = removeUndefinedKeys({ ...searchParams, ...params });
    const urlSearchParams = new URLSearchParams(combinedPrams).toString();
    history.pushState(
      {},
      '',
      location.pathname + (urlSearchParams.length ? `?${urlSearchParams}` : ''),
    );

    // Update search params state
    internalSetSearchParams(combinedPrams);
  };

  return [searchParams, updateSearchParams];
};
