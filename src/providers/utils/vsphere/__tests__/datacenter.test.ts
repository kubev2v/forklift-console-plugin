import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import {
  getDatacenterNames,
  isCopyApplianceFolderWithinDatacenter,
  isVSphereEsxiProvider,
} from '../datacenter';

const provider = (settings?: Record<string, string>): V1beta1Provider =>
  ({ spec: { settings } }) as V1beta1Provider;

describe('isVSphereEsxiProvider', () => {
  it('is true only for ESXi endpoints', () => {
    expect(isVSphereEsxiProvider(provider({ sdkEndpoint: 'esxi' }))).toBe(true);
    expect(isVSphereEsxiProvider(provider({ sdkEndpoint: 'vcenter' }))).toBe(false);
    expect(isVSphereEsxiProvider(provider())).toBe(false);
  });
});

describe('isCopyApplianceFolderWithinDatacenter', () => {
  it('matches a single-segment datacenter name anywhere in the folder path', () => {
    expect(isCopyApplianceFolderWithinDatacenter('/DC1/vm/appliance', 'DC1')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('DC1/vm/appliance', 'DC1')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/DC1', 'DC1')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/DC2', 'DC2')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/east/DC0/vm/x', 'DC0')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/DC1/vm/x', 'DC2')).toBe(false);
  });

  it('requires a multi-segment datacenter path to prefix the folder path', () => {
    expect(isCopyApplianceFolderWithinDatacenter('/east/DC0/vm/x', '/east/DC0')).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/east/DC1/vm/x', '/east/DC0')).toBe(false);
  });

  it('treats a missing folder as not within a datacenter', () => {
    expect(isCopyApplianceFolderWithinDatacenter(undefined, 'DC1')).toBe(false);
    expect(isCopyApplianceFolderWithinDatacenter('   ', 'DC1')).toBe(false);
  });

  it('treats an unscoped datacenter as compatible with any folder', () => {
    expect(isCopyApplianceFolderWithinDatacenter('/DC1/vm/appliance', undefined)).toBe(true);
    expect(isCopyApplianceFolderWithinDatacenter('/DC1/vm/appliance', '  ')).toBe(true);
  });

  it('trims whitespace around the datacenter name', () => {
    expect(isCopyApplianceFolderWithinDatacenter('/DC1/vm/appliance', ' DC1 ')).toBe(true);
  });
});

describe('getDatacenterNames', () => {
  it('trims, drops empty names, dedupes, and sorts', () => {
    expect(
      getDatacenterNames([{ name: 'DC2' }, { name: ' DC1 ' }, { name: 'DC1' }, { name: '  ' }]),
    ).toEqual(['DC1', 'DC2']);
    expect(getDatacenterNames([{ name: 'dc-2' }, { name: 'dc-1' }])).toEqual(['dc-1', 'dc-2']);
  });

  it('returns an empty list for missing inventory', () => {
    expect(getDatacenterNames(null)).toEqual([]);
    expect(getDatacenterNames(undefined)).toEqual([]);
  });
});
