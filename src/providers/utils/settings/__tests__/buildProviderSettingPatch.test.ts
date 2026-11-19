import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { buildProviderSettingPatch } from '../buildProviderSettingPatch';

const provider = (settings?: Record<string, string>): V1beta1Provider =>
  ({ spec: settings ? { settings } : {} }) as V1beta1Provider;

describe('buildProviderSettingPatch', () => {
  it('adds the whole settings map when the provider has no settings', () => {
    expect(buildProviderSettingPatch(provider(), 'datacenter', 'DC1')).toEqual([
      { op: 'add', path: '/spec/settings', value: { datacenter: 'DC1' } },
    ]);
  });

  it('does not patch when the provider has no settings and the value is empty', () => {
    expect(buildProviderSettingPatch(provider(), 'datacenter', '')).toEqual([]);
    expect(buildProviderSettingPatch(provider(), 'datacenter', undefined)).toEqual([]);
  });

  it('adds a missing setting', () => {
    expect(
      buildProviderSettingPatch(provider({ sdkEndpoint: 'vcenter' }), 'datacenter', 'DC1'),
    ).toEqual([{ op: 'add', path: '/spec/settings/datacenter', value: 'DC1' }]);
  });

  it('replaces an existing setting', () => {
    expect(buildProviderSettingPatch(provider({ datacenter: 'DC1' }), 'datacenter', 'DC2')).toEqual(
      [{ op: 'replace', path: '/spec/settings/datacenter', value: 'DC2' }],
    );
  });

  it('removes a setting when the new value is empty', () => {
    expect(buildProviderSettingPatch(provider({ datacenter: 'DC1' }), 'datacenter', '')).toEqual([
      { op: 'remove', path: '/spec/settings/datacenter' },
    ]);
  });

  it('ignores empty values for settings that are already absent', () => {
    expect(
      buildProviderSettingPatch(provider({ sdkEndpoint: 'vcenter' }), 'datacenter', ''),
    ).toEqual([]);
  });

  it('trims the value and skips unchanged settings', () => {
    expect(
      buildProviderSettingPatch(provider({ datacenter: 'DC1' }), 'datacenter', '  DC1  '),
    ).toEqual([]);
    expect(buildProviderSettingPatch(provider(), 'datacenter', '  DC1  ')).toEqual([
      { op: 'add', path: '/spec/settings', value: { datacenter: 'DC1' } },
    ]);
  });
});
