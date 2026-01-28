import type { NetworkAdapters } from '@forklift-ui/types';

import { findNetworkAdapterByNameAndIp } from '../onSaveHost';

/**
 * Test for MTV-2654 fix: Ensure correct IP is selected when multiple adapters have the same name
 *
 * ESXi hosts can have multiple network adapters with the same name (e.g., VDSwitch)
 * but different IP addresses. The fix ensures we match by BOTH name AND ipAddress.
 */
describe('findNetworkAdapterByNameAndIp', () => {
  const createNetworkAdapter = (
    ipAddress: string,
    subnetMask = '255.255.255.0',
  ): NetworkAdapters => ({
    ipAddress,
    linkSpeed: 25000,
    mtu: 9000,
    name: 'VDSwitch',
    subnetMask,
  });

  const networkAdaptersWithDuplicateNames: NetworkAdapters[] = [
    createNetworkAdapter('10.11.12.108'),
    createNetworkAdapter('192.168.1.14'),
    createNetworkAdapter('170.254.67.190', '255.255.0.0'),
  ];

  test('should return the correct adapter when user selects first IP', () => {
    const selectedNetwork = createNetworkAdapter('10.11.12.108');

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe('10.11.12.108');
  });

  test('should return the correct adapter when user selects second IP', () => {
    const selectedNetwork = createNetworkAdapter('192.168.1.14');

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe('192.168.1.14');
  });

  test('should return the correct adapter when user selects third IP', () => {
    const selectedNetwork = createNetworkAdapter('170.254.67.190', '255.255.0.0');

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe('170.254.67.190');
  });

  test('should return undefined when network is not found', () => {
    const selectedNetwork = createNetworkAdapter('999.999.999.999');

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeUndefined();
  });

  test('should return undefined when adapters array is empty', () => {
    const selectedNetwork = createNetworkAdapter('10.11.12.108');

    const result = findNetworkAdapterByNameAndIp([], selectedNetwork);

    expect(result).toBeUndefined();
  });

  test('should not match adapter with same IP but different name', () => {
    const adapters: NetworkAdapters[] = [
      {
        ipAddress: '10.11.12.108',
        linkSpeed: 25000,
        mtu: 9000,
        name: 'DifferentSwitch',
        subnetMask: '255.255.255.0',
      },
    ];
    const selectedNetwork = createNetworkAdapter('10.11.12.108');

    const result = findNetworkAdapterByNameAndIp(adapters, selectedNetwork);

    expect(result).toBeUndefined();
  });
});
