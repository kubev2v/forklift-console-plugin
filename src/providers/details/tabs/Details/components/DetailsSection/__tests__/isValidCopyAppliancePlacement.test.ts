import { describe, expect, it } from '@jest/globals';

import { isValidCopyAppliancePlacement } from '../isValidCopyAppliancePlacement';

const values = {
  datastore: 'datastore-1',
  folder: '/vm/folder',
  network: 'network-1',
  resourcePool: '/pool-1',
};
const options = {
  datastore: [{ itemId: values.datastore }],
  folder: [{ itemId: values.folder }],
  network: [{ itemId: values.network }],
  resourcePool: [{ itemId: values.resourcePool }],
};

describe('isValidCopyAppliancePlacement', () => {
  it('requires all four selected values to match enabled inventory options', () => {
    expect(isValidCopyAppliancePlacement(values, options)).toBe(true);

    for (const field of Object.keys(values) as (keyof typeof values)[]) {
      expect(isValidCopyAppliancePlacement({ ...values, [field]: '' }, options)).toBe(false);
    }
  });

  it('rejects disabled and stale inventory choices', () => {
    expect(
      isValidCopyAppliancePlacement(values, {
        ...options,
        datastore: [{ isDisabled: true, itemId: values.datastore }],
      }),
    ).toBe(false);
    expect(
      isValidCopyAppliancePlacement(values, {
        ...options,
        resourcePool: [{ itemId: '/new-pool' }],
      }),
    ).toBe(false);
  });
});
