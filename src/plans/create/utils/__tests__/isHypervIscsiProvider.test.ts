import { HypervTransferMethod } from 'src/providers/create/fields/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { isHypervIscsiProvider } from 'src/providers/utils/helpers/isHypervIscsiProvider';

import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

const makeProvider = (type: string, transferMethod?: string): V1beta1Provider =>
  ({
    spec: {
      type,
      ...(transferMethod && { settings: { hyperVTransferMethod: transferMethod } }),
    },
  }) as unknown as V1beta1Provider;

describe('isHypervIscsiProvider', () => {
  it('returns true for hyperv provider with iSCSI transfer method', () => {
    expect(
      isHypervIscsiProvider(makeProvider(PROVIDER_TYPES.hyperv, HypervTransferMethod.ISCSI)),
    ).toBe(true);
  });

  it('returns false for hyperv provider with SMB transfer method', () => {
    expect(
      isHypervIscsiProvider(makeProvider(PROVIDER_TYPES.hyperv, HypervTransferMethod.SMB)),
    ).toBe(false);
  });

  it('returns false for hyperv provider without settings', () => {
    expect(isHypervIscsiProvider(makeProvider(PROVIDER_TYPES.hyperv))).toBe(false);
  });

  it('returns false for non-hyperv provider with iSCSI setting', () => {
    expect(
      isHypervIscsiProvider(makeProvider(PROVIDER_TYPES.vsphere, HypervTransferMethod.ISCSI)),
    ).toBe(false);
  });

  it('returns false for undefined provider', () => {
    expect(isHypervIscsiProvider(undefined)).toBe(false);
  });
});
