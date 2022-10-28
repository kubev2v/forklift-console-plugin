import { NAME, NAMESPACE } from 'src/utils/constants';

import { createMatcher, createMetaMatcher, freetextMatcher } from '../matchers';

const matchFreetext = (
  selectedFilters,
  filter = {
    type: 'freetext',
    toPlaceholderLabel: () => NAME,
  },
) =>
  createMatcher({
    selectedFilters,
    ...freetextMatcher,
    fields: [
      {
        id: NAME,
        toLabel: () => NAME,
        filter,
      },
    ],
  });

describe('standard matchers', () => {
  it('matches the entity by single letter', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('is not matching the entity because the value does not include selected substrings', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({ [NAME]: 'foo' })).toBeFalsy();
  });

  it('is not matching the entity because entity has no such field', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match({})).toBeFalsy();
  });

  it('is not matching the entity because entity is nullish', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] });
    expect(match(null)).toBeFalsy();
  });

  it('matches the entity because column has no filter', () => {
    const match = matchFreetext({ [NAME]: ['b', 'c', 'd'] }, null);
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('matches the entity because column has a different filter', () => {
    const match = matchFreetext(
      { [NAME]: ['b', 'c', 'd'] },
      {
        type: 'enum',
        toPlaceholderLabel: () => NAME,
      },
    );
    expect(match({ [NAME]: 'bar' })).toBeTruthy();
  });

  it('matches the entity because no filters are selected', () => {
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
        id: NAME,
        toLabel: () => NAME,
        filter: {
          type: 'freetext',
          toPlaceholderLabel: () => NAME,
        },
      },
      {
        id: NAMESPACE,
        toLabel: () => NAMESPACE,
        filter: {
          type: 'freetext',
          toPlaceholderLabel: () => NAMESPACE,
        },
      },
    ],
  );

describe('meta matchers', () => {
  it('matches the entity on both columns', () => {
    const matchBoth = matchBothFieldsFreetext();
    expect(matchBoth({ [NAME]: 'foo', [NAMESPACE]: 'bar' })).toBeTruthy();
  });

  it('is not matching because of namespace column', () => {
    const matchBoth = matchBothFieldsFreetext();
    expect(matchBoth({ [NAME]: 'foo', [NAMESPACE]: 'foo' })).toBeFalsy();
  });
});
