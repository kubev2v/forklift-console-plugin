import type { K8sResourceCondition } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import { LEGACY_PROVIDER_WARNING_CATEGORY } from '../providerConditionUtils';
import {
  isElevatedProviderCondition,
  selectElevatedProviderConditions,
} from '../selectElevatedProviderConditions';

const makeCondition = (overrides: Record<string, unknown> = {}): K8sResourceCondition =>
  ({
    category: CATEGORY_TYPES.CRITICAL,
    status: CONDITION_STATUS.TRUE,
    type: 'ConnectionTestFailed',
    ...overrides,
  }) as K8sResourceCondition;

describe('selectElevatedProviderConditions', () => {
  it('includes True Critical and Warn conditions', () => {
    const conditions = [
      makeCondition({ category: CATEGORY_TYPES.CRITICAL, type: 'UrlNotValid' }),
      makeCondition({ category: CATEGORY_TYPES.WARNING, type: 'ConnectionInsecure' }),
      makeCondition({ category: LEGACY_PROVIDER_WARNING_CATEGORY, type: 'LegacyWarning' }),
    ];

    expect(selectElevatedProviderConditions(conditions)).toHaveLength(3);
  });

  it('excludes False, Advisory, and Required conditions', () => {
    const conditions = [
      makeCondition({ category: CATEGORY_TYPES.CRITICAL, status: CONDITION_STATUS.FALSE }),
      makeCondition({ category: 'Advisory', type: 'Validated' }),
      makeCondition({ category: 'Required', type: 'InventoryCreated' }),
    ];

    expect(selectElevatedProviderConditions(conditions)).toHaveLength(0);
  });

  it('returns empty array when conditions are undefined', () => {
    expect(selectElevatedProviderConditions(undefined)).toEqual([]);
  });
});

describe('isElevatedProviderCondition', () => {
  it('returns false for undefined condition', () => {
    expect(isElevatedProviderCondition(undefined)).toBe(false);
  });
});
