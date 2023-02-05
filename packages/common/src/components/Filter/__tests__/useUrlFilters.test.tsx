import { NAME } from 'common/src/utils/constants';

import { act, cleanup, renderHook } from '@testing-library/react-hooks';

import { useUrlFilters } from '../useUrlFilters';

afterEach(cleanup);
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { assign: jest.fn() },
  });
  window.location.pathname = '';
  window.history.pushState = jest.fn();
});

describe('parse filters from the URL on initialization', () => {
  const cases: [string, string, string[]][] = [
    ['gets initialized with single value', '?name=%5B"foo"%5D', ['foo']],
    ['gets initialized with 2 values', '?name=%5B"foo"%2C"bar"%5D', ['foo', 'bar']],
    ['ignores empty JSON array', '?name=%5B%5D', undefined],
    ['ignores data different then JSON array', '?name="foo"', undefined],
    ['ignores corrupted data', '?name=%5B%foo', undefined],
  ];

  cases.forEach(([description, search, output]) =>
    it(description, () => {
      window.location.search = search;
      const {
        result: {
          current: [selectedFilters],
        },
      } = renderHook(() =>
        useUrlFilters({
          fields: [{ id: NAME, toLabel: () => NAME }],
        }),
      );
      expect(selectedFilters[NAME]).toStrictEqual(output);
    }),
  );

  it('ignores unknown field', () => {
    window.location.search = '?ready=%5B"True"%5D';
    const {
      result: {
        current: [selectedFilters],
      },
    } = renderHook(() =>
      useUrlFilters({
        fields: [{ id: NAME, toLabel: () => NAME }],
      }),
    );
    expect(Object.entries(selectedFilters).length).toStrictEqual(0);
  });

  it('supports prefixing params', () => {
    window.location.search = '?barname=%5B"foo"%5D';
    const {
      result: {
        current: [selectedFilters],
      },
    } = renderHook(() =>
      useUrlFilters({
        fields: [{ id: NAME, toLabel: () => NAME }],
        filterPrefix: 'bar',
      }),
    );
    expect(selectedFilters[NAME]).toStrictEqual(['foo']);
  });
});

describe('display currrently selected filters in the URL', () => {
  test.each([
    ['displays single value', '?foo=bar', ['foo'], '?foo=bar&name=%5B%22foo%22%5D'],
    ['updates a value', '?foo=bar&name=%5B"foo"%5D', ['bar'], '?foo=bar&name=%5B%22bar%22%5D'],
    ['removes a filter', '?foo=bar&name=%5B"foo"%5D', [], '?foo=bar'],
  ])('%s', (description, initialUrl, update, pushedState) => {
    window.location.search = initialUrl;
    const {
      result: {
        current: [, setSelectedFilters],
      },
    } = renderHook(() =>
      useUrlFilters({
        fields: [{ id: NAME, toLabel: () => NAME }],
      }),
    );
    act(() => setSelectedFilters({ [NAME]: update }));
    expect(window.history.pushState).toBeCalledWith({}, '', pushedState);
  });
});
