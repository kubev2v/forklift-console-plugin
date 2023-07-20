import { calculateCidrNotation } from '../calculateCidrNotation';

describe('calculateCidrNotation', () => {
  test('should return correct CIDR notation', () => {
    expect(calculateCidrNotation('192.168.1.1', '255.255.255.0')).toBe('192.168.1.1/24');
    expect(calculateCidrNotation('10.0.0.1', '255.0.0.0')).toBe('10.0.0.1/8');
    expect(calculateCidrNotation('172.16.0.1', '255.255.0.0')).toBe('172.16.0.1/16');
  });

  test('should throw error for invalid subnet mask', () => {
    expect(() => calculateCidrNotation('192.168.1.1', '255.256.255.0')).toThrow(
      'Subnet mask must be a valid IPv4 address.',
    );
    expect(() => calculateCidrNotation('192.168.1.1', '255.255.255')).toThrow(
      'Subnet mask must be a valid IPv4 address.',
    );
  });
});
