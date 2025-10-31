import { NAME, NAMESPACE } from '@components/common/utils/constants';
import type { FilterDef } from '@components/common/utils/types';

import { createMatcher, createMetaMatcher, freetextMatcher } from '../matchers';

const matchFreetext = (
  selectedFilters: { name?: string[] },
  filter: FilterDef | null = {
    placeholderLabel: NAME,
    type: 'freetext',
  },
) =>
  createMatcher({
    selectedFilters,
    ...freetextMatcher,
    resourceFields: [
      {
        filter,
        label: NAME,
        resourceFieldId: NAME,
      },
    ],
  });

describe('standard matchers', () => {
  it('matches the resourceData by single letter', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('is not matching the resourceData because the value does not include selected substrings', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({ [NAME]: 'foo' })).toBeFalsy();
  });

  it('is not matching the resourceData because resourceData has no such field', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({})).toBeFalsy();
  });

  it('is not matching the resourceData because resourceData is nullish', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match(null)).toBeFalsy();
  });

  it('matches the resourceData because column has no filter', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] }, null);
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('matches the resourceData because column has a different filter', () => {
    const match = matchFreetext(
      { [NAME]: ['b', 'c', 'd'] },
      {
        placeholderLabel: NAME,
        type: 'enum',
      },
    );
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('matches the resourceData because no filters are selected', () => {
    const match = matchFreetext({});
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });
});

const matchBothFieldsFreetext = () =>
  createMetaMatcher(
    {
      [NAME]: ['oo'],
      [NAMESPACE]: ['ar'],
    },
    [
      {
        filter: {
          placeholderLabel: NAME,
          type: 'freetext',
        },
        label: NAME,
        resourceFieldId: NAME,
      },
      {
        filter: {
          placeholderLabel: NAMESPACE,
          type: 'freetext',
        },
        label: NAMESPACE,
        resourceFieldId: NAMESPACE,
      },
    ],
  );

describe('meta matchers', () => {
  it('matches the resourceData on both resourceFields', () => {
    const matchBoth = matchBothFieldsFreetext();
    expect(matchBoth({ [NAME]: 'foo', [NAMESPACE]: 'bar' })).toBeTruthy();
  });

  it('is not matching because of namespace column', () => {
    const matchBoth = matchBothFieldsFreetext();
    expect(matchBoth({ [NAME]: 'foo', [NAMESPACE]: 'foo' })).toBeFalsy();
  });
});
