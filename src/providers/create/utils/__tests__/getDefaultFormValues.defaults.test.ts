import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { getDefaultFormValues } from '../getDefaultFormValues';

describe('providers getDefaultFormValues - defaults', () => {
  it('sets project and optional provider type', () => {
    expect(getDefaultFormValues('ns')).toEqual({
      [ProviderFormFieldId.ProviderName]: '',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: undefined,
    });
    expect(getDefaultFormValues('ns', 'vsphere')[ProviderFormFieldId.ProviderType]).toBe('vsphere');
  });
});
