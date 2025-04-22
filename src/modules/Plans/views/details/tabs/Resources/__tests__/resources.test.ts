import { expect } from '@jest/globals';

import { k8sMemoryToBytes } from '../OpenshiftPlanResources';

describe('k8sMemoryToBytes', () => {
  it('should correctly convert memory strings to bytes', () => {
    expect(k8sMemoryToBytes('512Mi')).toBe(512 * 2 ** 20); // 512 MiB to bytes
    expect(k8sMemoryToBytes('1Gi')).toBe(1 * 2 ** 30); // 1 GiB to bytes
    expect(k8sMemoryToBytes('2Ti')).toBe(2 * 2 ** 40); // 2 TiB to bytes
    expect(k8sMemoryToBytes('1024Ki')).toBe(1024 * 2 ** 10); // 1024 KiB to bytes
    expect(k8sMemoryToBytes('1M')).toBe(1 * 10 ** 6); // 1 MB to bytes
    expect(k8sMemoryToBytes('1G')).toBe(1 * 10 ** 9); // 1 GB to bytes
    expect(k8sMemoryToBytes('1T')).toBe(1 * 10 ** 12); // 1 TB to bytes
    expect(k8sMemoryToBytes('123')).toBe(123); // Plain bytes
  });

  it('should handle case-insensitive units', () => {
    expect(k8sMemoryToBytes('1mi')).toBe(1 * 2 ** 20); // Lowercase unit
    expect(k8sMemoryToBytes('1GI')).toBe(1 * 2 ** 30); // Mixed case unit
  });

  it('should throw an error for invalid memory strings', () => {
    expect(() => k8sMemoryToBytes('invalid')).toThrow('Invalid memory string format');
    expect(() => k8sMemoryToBytes('123XYZ')).toThrow('Invalid memory string format');
    expect(() => k8sMemoryToBytes('')).toThrow('Invalid memory string format');
  });
});
