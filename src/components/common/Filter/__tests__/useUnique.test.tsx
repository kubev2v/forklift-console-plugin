import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useUnique } from '../EnumFilter';

afterEach(cleanup);

const testEnumValues = [
  { id: 'True', label: 'TrueTranslated' },
  { id: 'AlsoTrue', label: 'TrueTranslated' },
  { id: 'False', label: 'FalseTranslated' },
];

describe('aggregate filters with the same labels', () => {
  it('selects an aggregated filter(no other filters selected)', () => {
    const onSelectedEnumIdsChange = jest.fn();
    const {
      result: {
        current: { onUniqueFilterUpdate, selectedUniqueEnumLabels, uniqueEnumLabels },
      },
    } = renderHook(() =>
      useUnique({
        onSelectedEnumIdsChange,
        resolvedLanguage: 'en',
        selectedEnumIds: [],
        supportedEnumValues: testEnumValues,
      }),
    );
    expect(uniqueEnumLabels).toStrictEqual(['FalseTranslated', 'TrueTranslated']);
    expect(selectedUniqueEnumLabels).toStrictEqual([]);
    onUniqueFilterUpdate(['TrueTranslated']);
    expect(onSelectedEnumIdsChange).toBeCalledWith(['True', 'AlsoTrue']);
  });

  it('selects a standard filter(one filter already selected)', () => {
    const onSelectedEnumIdsChange = jest.fn();
    const {
      result: {
        current: { onUniqueFilterUpdate, selectedUniqueEnumLabels, uniqueEnumLabels },
      },
    } = renderHook(() =>
      useUnique({
        onSelectedEnumIdsChange,
        resolvedLanguage: 'en',
        selectedEnumIds: ['True', 'AlsoTrue'],
        supportedEnumValues: testEnumValues,
      }),
    );
    expect(uniqueEnumLabels).toStrictEqual(['FalseTranslated', 'TrueTranslated']);
    expect(selectedUniqueEnumLabels).toStrictEqual(['TrueTranslated']);
    onUniqueFilterUpdate(['TrueTranslated', 'FalseTranslated']);
    expect(onSelectedEnumIdsChange).toBeCalledWith(['True', 'AlsoTrue', 'False']);
  });
});
