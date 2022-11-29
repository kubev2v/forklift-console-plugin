import * as React from 'react';

/**
 * Take a url string and convert it to a search params map
 *
 * @param {string} search params url string
 * @returns {{}} a key:value map of the search params
 */
const toMap = (search: string) => {
  const params = new URLSearchParams(search);
  const map = {};
  params.forEach((value, key) => {
    map[key] = value;
  });
  return map;
};

/**
 * A hook to get and set the URL search params.
 *
 * @returns the URL search params as a key:value map, and a URL
 *          search params setter method
 */
export const useSearchParams = (): [object, SetURLSearchParams] => {
  const [searchParams, internalSetSearchParams] = React.useState(toMap(location.search));

  /**
   * Set the internal search params state
   *
   * @param {object} params
   */
  const setSearchParams = (params: object) => {
    const combinedPrams = { ...searchParams, ...params };

    const urlSearchParams = new URLSearchParams(combinedPrams);
    history.pushState({}, '', location.pathname + '?' + urlSearchParams.toString());

    // Update search params state
    internalSetSearchParams(combinedPrams);
  };

  return [searchParams, setSearchParams];
};

type SetURLSearchParams = (object) => void;
