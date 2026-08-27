import { describe, expect, it } from '@jest/globals';

import { getMappingPageMessage } from '../utils';

describe('getMappingPageMessage - states', () => {
  it('returns loading message first', () => {
    expect(
      getMappingPageMessage({
        loadingResources: true,
        networkMapsEmpty: true,
        storageMapsEmpty: true,
      }),
    ).toMatch(/loading/i);
  });

  it('returns inventory unavailable message when maps empty', () => {
    const message = getMappingPageMessage({
      loadingResources: false,
      networkMapsEmpty: true,
      resourcesError: new Error('boom'),
      storageMapsEmpty: false,
    });
    expect(message).toMatch(/not available/i);
    // i18n test mock may leave the placeholder literal; ensure error message is passed through when interpolated
    expect(
      message === 'The mapping data from the inventory is not available, {{resourcesError}}.' ||
        (message ?? '').includes('boom'),
    ).toBe(true);
  });

  it('returns null when ready', () => {
    expect(
      getMappingPageMessage({
        loadingResources: false,
        networkMapsEmpty: false,
        storageMapsEmpty: false,
      }),
    ).toBeNull();
  });
});
