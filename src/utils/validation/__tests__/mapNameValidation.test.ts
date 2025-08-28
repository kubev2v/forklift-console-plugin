import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { validateMapName } from '../mapNameValidation';

describe('validateMapName', () => {
  const mapType = 'Network map';

  describe('valid names', () => {
    it('should return undefined for valid K8s names', () => {
      const result = validateMapName('my-network-map', mapType);
      expect(result).toBeUndefined();
    });
  });

  describe('required field validation', () => {
    it('should return error for empty string', () => {
      const result = validateMapName('', mapType);
      expect(result).toBe('Network map name is required.');
    });

    it('should return error for whitespace-only string', () => {
      const result = validateMapName('   ', mapType);
      expect(result).toBe('Network map name is required.');
    });

    it('should return error for invalid strings', () => {
      const result = validateMapName('network_map', mapType);
      expect(result).toContain('must be a valid DNS subdomain name');
    });
  });

  describe('K8s naming constraints', () => {
    it('should return error for names with invalid characters', () => {
      const result = validateMapName('network_map', mapType);
      expect(result).toBe(
        'Network map name must be a valid DNS subdomain name. It should contain only lowercase alphanumeric characters or hyphens, and must start and end with alphanumeric characters.',
      );
    });

    it('should return error for names starting with invalid characters', () => {
      const invalidNames = ['-network-map', '.network-map'];

      invalidNames.forEach((name) => {
        const result = validateMapName(name, mapType);
        expect(result).toContain('must be a valid DNS subdomain name');
      });
    });

    it('should return error for names ending with invalid characters', () => {
      const invalidNames = ['network-map-', 'network-map.'];

      invalidNames.forEach((name) => {
        const result = validateMapName(name, mapType);
        expect(result).toContain('must be a valid DNS subdomain name');
      });
    });

    it('should return error for names that are too long', () => {
      const longName = 'a'.repeat(254);
      const result = validateMapName(longName, mapType);
      expect(result).toContain('must be a valid DNS subdomain name');
    });

    it('should return error for consecutive dots or hyphens in invalid positions', () => {
      const invalidNames = ['network..map', 'network.-map', 'network-.map'];

      invalidNames.forEach((name) => {
        const result = validateMapName(name, mapType);
        expect(result).toContain('must be a valid DNS subdomain name');
      });
    });
  });

  describe('different map types', () => {
    it('should use the provided map type in error messages', () => {
      const storageMapResult = validateMapName('', 'Storage map');
      expect(storageMapResult).toBe('Storage map name is required.');

      const networkMapResult = validateMapName('', 'Network map');
      expect(networkMapResult).toBe('Network map name is required.');

      const invalidStorageResult = validateMapName('invalid_name', 'Storage map');
      expect(invalidStorageResult).toContain('Storage map name must be a valid');

      const invalidNetworkResult = validateMapName('invalid_name', 'Network map');
      expect(invalidNetworkResult).toContain('Network map name must be a valid');
    });
  });

  describe('edge cases', () => {
    it('should handle names at the character limit (253 chars)', () => {
      const maxLengthName = 'a'.repeat(253);
      const result = validateMapName(maxLengthName, mapType);
      expect(result).toBeUndefined();
    });

    it('should trim whitespace before validation', () => {
      const result = validateMapName('   ', mapType);
      expect(result).toBe('Network map name is required.');
    });
  });
});
