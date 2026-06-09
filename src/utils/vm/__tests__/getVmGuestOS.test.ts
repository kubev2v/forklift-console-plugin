import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getVmGuestOS } from '../getVmGuestOS';

const makeVm = (overrides: Partial<ProviderVirtualMachine>) => overrides as ProviderVirtualMachine;

describe('getVmGuestOS', () => {
  it('returns empty string for undefined', () => {
    expect(getVmGuestOS(undefined)).toBe('');
  });

  it('returns guestName for vsphere when available', () => {
    expect(
      getVmGuestOS(
        makeVm({
          providerType: 'vsphere',
          guestName: 'Microsoft Windows 11 (64-bit)',
          guestNameFromVmwareTools: 'Microsoft Windows 11',
          guestId: 'windows11_64Guest',
        }),
      ),
    ).toBe('Microsoft Windows 11 (64-bit)');
  });

  it('falls back to guestNameFromVmwareTools for vsphere', () => {
    expect(
      getVmGuestOS(
        makeVm({
          providerType: 'vsphere',
          guestName: '',
          guestNameFromVmwareTools: 'Microsoft Windows 11',
          guestId: 'windows11_64Guest',
        }),
      ),
    ).toBe('Microsoft Windows 11');
  });

  it('falls back to guestId for vsphere', () => {
    expect(
      getVmGuestOS(
        makeVm({
          providerType: 'vsphere',
          guestName: '',
          guestNameFromVmwareTools: '',
          guestId: 'windows11_64Guest',
        }),
      ),
    ).toBe('windows11_64Guest');
  });

  it('returns empty string when all vsphere fields are missing', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'vsphere' }))).toBe('');
  });

  it('returns guestOS for hyperv', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'hyperv', guestOS: 'Ubuntu 22.04' }))).toBe(
      'Ubuntu 22.04',
    );
  });

  it('returns empty string when hyperv guestOS is missing', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'hyperv' }))).toBe('');
  });

  it('returns osType for ova', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'ova', osType: 'rhel9_64Guest' }))).toBe(
      'rhel9_64Guest',
    );
  });

  it('returns guestName for ovirt when available', () => {
    expect(
      getVmGuestOS(
        makeVm({ providerType: 'ovirt', guestName: 'CentOS Linux 7.9', osType: 'rhel_8x64' }),
      ),
    ).toBe('CentOS Linux 7.9');
  });

  it('falls back to osType for ovirt when guestName is empty', () => {
    expect(
      getVmGuestOS(makeVm({ providerType: 'ovirt', guestName: '', osType: 'rhel_8x64' })),
    ).toBe('rhel_8x64');
  });

  it('returns osType for ovirt when guestName is missing', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'ovirt', osType: 'rhel_8x64' }))).toBe('rhel_8x64');
  });

  it('returns empty string for openshift', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'openshift' }))).toBe('');
  });

  it('returns empty string for openstack', () => {
    expect(getVmGuestOS(makeVm({ providerType: 'openstack' }))).toBe('');
  });
});
