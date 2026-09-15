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

  it('should return true for valid IPv6 URLs', () => {
    const urls = [
      'https://[2620:52:0:2ef8:f2d4:e2ff:feea:4b6c]/sdk',
      'https://[2001:db8::1]/sdk',
      'https://[2001:db8::1]:443/sdk',
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

  it('should return false for invalid IPv6 URLs', () => {
    const urls = ['https://2001:db8::1/sdk', 'https://[]/sdk', 'https://[not:valid:ipv6]/sdk'];
    for (const url of urls) {
      expect(validateURL(url)).toBe(false);
    }
  });
});
