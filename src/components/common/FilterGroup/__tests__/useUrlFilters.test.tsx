import { NAME } from '@components/common/utils/constants';
import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { useUrlFilters } from '../useUrlFilters';

afterEach(cleanup);
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { assign: jest.fn() },
    writable: true,
  });
  window.location.pathname = '';
  window.history.pushState = jest.fn();
});

describe('parse filters from the URL on initialization', () => {
  const cases: [string, string, string[] | undefined][] = [
    ['gets initialized with single value', '?name=%5B"foo"%5D', ['foo']],
    ['gets initialized with 2 values', '?name=%5B"foo"%2C"bar"%5D', ['foo', 'bar']],
    ['ignores empty JSON array', '?name=%5B%5D', undefined],
    ['ignores data different then JSON array', '?name="foo"', undefined],
    ['ignores corrupted data', '?name=%5B%foo', undefined],
  ];

  cases.forEach(([description, search, output]) => {
    it(description, () => {
      window.location.search = search;
      const {
        result: {
          current: [selectedFilters],
        },
      } = renderHook(() =>
        useUrlFilters({
          fields: [{ label: NAME, resourceFieldId: NAME }],
        }),
      );
      expect(selectedFilters[NAME]).toStrictEqual(output);
    });
  });

  it('ignores unknown field', () => {
    window.location.search = '?ready=%5B"True"%5D';
    const {
      result: {
        current: [selectedFilters],
      },
    } = renderHook(() =>
      useUrlFilters({
        fields: [{ label: NAME, resourceFieldId: NAME }],
      }),
    );
    expect(Object.entries(selectedFilters).length).toStrictEqual(0);
  });
});

describe('display currently selected filters in the URL', () => {
  test.each([
    {
      description: 'displays single value',
      initialUrl: '?foo=bar',
      update: ['foo'],
      pushedState: '?foo=bar&name=%5B%22foo%22%5D',
    },
    {
      description: 'updates a value',
      initialUrl: '?foo=bar&name=%5B"foo"%5D',
      update: ['bar'],
      pushedState: '?foo=bar&name=%5B%22bar%22%5D',
    },
    {
      description: 'removes a filter',
      initialUrl: '?foo=bar&name=%5B"foo"%5D',
      update: [],
      pushedState: '?foo=bar',
    },
  ])('%s', ({ description, initialUrl, update, pushedState }) => {
    window.location.search = initialUrl;
    const {
      result: {
        current: [, setSelectedFilters],
      },
    } = renderHook(() =>
      useUrlFilters({
        fields: [{ label: NAME, resourceFieldId: NAME }],
      }),
    );
    act(() => {
      setSelectedFilters({ [NAME]: update });
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(window.history.pushState).toBeCalledWith({}, '', pushedState);
  });
});
