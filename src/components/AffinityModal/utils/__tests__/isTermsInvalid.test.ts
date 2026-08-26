jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { isTermsInvalid } from '../isTermsInvalid';
import type { AffinityLabel } from '../types';

const term = (overrides: Partial<AffinityLabel> = {}): AffinityLabel => ({
  id: 0,
  key: 'app',
  operator: Operator.Exists,
  values: [],
  ...overrides,
});

describe('isTermsInvalid', () => {
  it('returns false for empty terms', () => {
    expect(isTermsInvalid([])).toBe(false);
  });

  it('returns true when a term has an empty key', () => {
    expect(isTermsInvalid([term({ key: '' })])).toBe(true);
  });

  it('returns true for In operator with empty values', () => {
    expect(isTermsInvalid([term({ operator: Operator.In, values: [] })])).toBe(true);
  });

  it('returns true for NotIn operator with empty values', () => {
    expect(isTermsInvalid([term({ operator: Operator.NotIn, values: [] })])).toBe(true);
  });

  it('returns false for In operator with values', () => {
    expect(isTermsInvalid([term({ operator: Operator.In, values: ['api'] })])).toBe(false);
  });

  it('returns false for Exists operator even with empty values', () => {
    expect(isTermsInvalid([term({ operator: Operator.Exists, values: [] })])).toBe(false);
  });

  it('returns false for DoesNotExist operator with empty values', () => {
    expect(isTermsInvalid([term({ operator: Operator.DoesNotExist, values: [] })])).toBe(false);
  });

  it('returns true when any term in the list is invalid', () => {
    expect(
      isTermsInvalid([
        term({ key: 'ok', operator: Operator.Exists }),
        term({ id: 1, key: '', operator: Operator.Exists }),
      ]),
    ).toBe(true);
  });
});
