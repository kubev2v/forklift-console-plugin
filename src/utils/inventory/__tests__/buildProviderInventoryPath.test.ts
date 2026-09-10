import { describe, expect, it } from '@jest/globals';

import { buildProviderInventoryPath } from '../buildProviderInventoryPath';

const PROVIDER_TYPE = 'hyperv';
const PROVIDER_UID = 'provider-uid-1';

describe('buildProviderInventoryPath', () => {
  it('appends detail=1 when subPath is omitted', () => {
    expect(buildProviderInventoryPath(PROVIDER_TYPE, PROVIDER_UID)).toBe(
      `providers/${PROVIDER_TYPE}/${PROVIDER_UID}?detail=1`,
    );
  });

  it('appends detail=1 when subPath is an empty string', () => {
    expect(buildProviderInventoryPath(PROVIDER_TYPE, PROVIDER_UID, '')).toBe(
      `providers/${PROVIDER_TYPE}/${PROVIDER_UID}?detail=1`,
    );
  });

  it('passes through a subPath that already includes a query string', () => {
    expect(buildProviderInventoryPath(PROVIDER_TYPE, PROVIDER_UID, 'hosts?detail=4')).toBe(
      `providers/${PROVIDER_TYPE}/${PROVIDER_UID}/hosts?detail=4`,
    );
  });

  it('does not append a second query string when subPath already has one', () => {
    const path = buildProviderInventoryPath(PROVIDER_TYPE, PROVIDER_UID, 'vms?detail=4');

    expect(path).toBe(`providers/${PROVIDER_TYPE}/${PROVIDER_UID}/vms?detail=4`);
    expect(path.split('?')).toHaveLength(2);
    expect(path).not.toContain('detail=1');
  });

  it('passes through a subPath without a query string', () => {
    expect(buildProviderInventoryPath(PROVIDER_TYPE, PROVIDER_UID, 'networks')).toBe(
      `providers/${PROVIDER_TYPE}/${PROVIDER_UID}/networks`,
    );
  });
});
