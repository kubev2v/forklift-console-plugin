import { NAME, NAMESPACE } from '../../../utils';
import { createMatcher, createMetaMatcher, freetextMatcher } from '../matchers';

const matchFreetext = (
  selectedFilters,
  filter = {
    type: 'freetext',
    placeholderLabel: NAME,
  },
) =>
  createMatcher({
    selectedFilters,
    ...freetextMatcher,
    resourceFields: [
      {
        resourceFieldId: NAME,
        label: NAME,
        filter,
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
        type: 'enum',
        placeholderLabel: NAME,
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
        resourceFieldId: NAME,
        label: NAME,
        filter: {
          type: 'freetext',
          placeholderLabel: NAME,
        },
      },
      {
        resourceFieldId: NAMESPACE,
        label: NAMESPACE,
        filter: {
          type: 'freetext',
          placeholderLabel: NAMESPACE,
        },
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
