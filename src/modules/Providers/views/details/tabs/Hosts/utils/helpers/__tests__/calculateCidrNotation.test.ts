import { calculateCidrNotation } from '../calculateCidrNotation';

const IPV4_ADDRESS = '192.168.1.1'; // NOSONAR

describe('calculateCidrNotation', () => {
  test('should return correct CIDR notation', () => {
    expect(calculateCidrNotation(IPV4_ADDRESS, '255.255.255.0')).toBe('192.168.1.1/24'); // NOSONAR
    expect(calculateCidrNotation('10.0.0.1', '255.0.0.0')).toBe('10.0.0.1/8'); // NOSONAR
    expect(calculateCidrNotation('172.16.0.1', '255.255.0.0')).toBe('172.16.0.1/16'); // NOSONAR
  });

  test('should throw error for invalid subnet mask', () => {
    expect(() => calculateCidrNotation(IPV4_ADDRESS, '255.256.255.0')).toThrow(
      'Subnet mask must be a valid IPv4 address.',
    );
    expect(() => calculateCidrNotation(IPV4_ADDRESS, '255.255.255')).toThrow(
      'Subnet mask must be a valid IPv4 address.',
    );
  });
});
