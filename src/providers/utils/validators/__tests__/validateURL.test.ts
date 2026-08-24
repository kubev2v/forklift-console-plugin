import { validateURL } from 'src/utils/validation/common';

describe('validateURL', () => {
  it('should return true for valid URLs', () => {
    const urls = [
      'https://example.com:8080/my/path?param=value',
      'http://192.168.1.1:8000', // NOSONAR
      'https://www.example.co.uk',
      'https://1.www.example.co.uk',
    ];
    for (const url of urls) {
      expect(validateURL(url)).toBe(true);
    }
  });

  it('should return false for invalid URLs', () => {
    const urls = [
      'http:/example.com',
      'http://example', // NOSONAR
    ];
    for (const url of urls) {
      expect(validateURL(url)).toBe(false);
    }
  });
});
