import type { NetworkAdapters } from '@forklift-ui/types';

import { findNetworkAdapterByNameAndIp } from '../onSaveHost';

// NOSONAR: These are mock IP addresses used only for testing purposes
const TEST_IP_1 = '10.11.12.108'; // NOSONAR
const TEST_IP_2 = '192.168.1.14'; // NOSONAR
const TEST_IP_3 = '170.254.67.190'; // NOSONAR
const TEST_IP_INVALID = '999.999.999.999'; // NOSONAR

const TEST_SUBNET_DEFAULT = '255.255.255.0'; // NOSONAR
const TEST_SUBNET_WIDE = '255.255.0.0'; // NOSONAR

/**
 * Test for MTV-2654 fix: Ensure correct IP is selected when multiple adapters have the same name
 *
 * ESXi hosts can have multiple network adapters with the same name (e.g., VDSwitch)
 * but different IP addresses. The fix ensures we match by BOTH name AND ipAddress.
 */
describe('findNetworkAdapterByNameAndIp', () => {
  const createNetworkAdapter = (
    ipAddress: string,
    subnetMask = TEST_SUBNET_DEFAULT,
  ): NetworkAdapters => ({
    ipAddress,
    linkSpeed: 25000,
    mtu: 9000,
    name: 'VDSwitch',
    subnetMask,
  });

  const networkAdaptersWithDuplicateNames: NetworkAdapters[] = [
    createNetworkAdapter(TEST_IP_1),
    createNetworkAdapter(TEST_IP_2),
    createNetworkAdapter(TEST_IP_3, TEST_SUBNET_WIDE),
  ];

  test('should return the correct adapter when user selects first IP', () => {
    const selectedNetwork = createNetworkAdapter(TEST_IP_1);

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe(TEST_IP_1);
  });

  test('should return the correct adapter when user selects second IP', () => {
    const selectedNetwork = createNetworkAdapter(TEST_IP_2);

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe(TEST_IP_2);
  });

  test('should return the correct adapter when user selects third IP', () => {
    const selectedNetwork = createNetworkAdapter(TEST_IP_3, TEST_SUBNET_WIDE);

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeDefined();
    expect(result?.ipAddress).toBe(TEST_IP_3);
  });

  test('should return undefined when network is not found', () => {
    const selectedNetwork = createNetworkAdapter(TEST_IP_INVALID);

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeUndefined();
  });

  test('should return undefined when adapters array is empty', () => {
    const selectedNetwork = createNetworkAdapter(TEST_IP_1);

    const result = findNetworkAdapterByNameAndIp([], selectedNetwork);

    expect(result).toBeUndefined();
  });

  test('should not match adapter with same IP but different name', () => {
    const adapters: NetworkAdapters[] = [
      {
        ipAddress: TEST_IP_1,
        linkSpeed: 25000,
        mtu: 9000,
        name: 'DifferentSwitch',
        subnetMask: TEST_SUBNET_DEFAULT,
      },
    ];
    const selectedNetwork = createNetworkAdapter(TEST_IP_1);

    const result = findNetworkAdapterByNameAndIp(adapters, selectedNetwork);

    expect(result).toBeUndefined();
  });

  test('should return undefined when network.ipAddress is undefined', () => {
    const selectedNetwork = {
      linkSpeed: 25000,
      mtu: 9000,
      name: 'VDSwitch',
      subnetMask: TEST_SUBNET_DEFAULT,
    } as NetworkAdapters;

    const result = findNetworkAdapterByNameAndIp(
      networkAdaptersWithDuplicateNames,
      selectedNetwork,
    );

    expect(result).toBeUndefined();
  });
});
