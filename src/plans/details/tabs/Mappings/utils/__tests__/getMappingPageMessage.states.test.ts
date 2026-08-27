import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

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
    expect(message).toBe('The mapping data from the inventory is not available, boom.');
    expect(message).toContain('boom');
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
