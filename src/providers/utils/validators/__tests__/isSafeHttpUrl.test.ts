import { isSafeHttpUrl } from 'src/utils/validation/common';

describe('isSafeHttpUrl', () => {
  it('should return true for valid http/https URLs', () => {
    const urls = [
      'https://vcenter.example.com/ui',
      'http://10.0.0.1:8080/path',
      'https://example.com',
      'http://localhost:3000',
    ];
    for (const url of urls) {
      expect(isSafeHttpUrl(url)).toBe(true);
    }
  });

  it('should return false for unsafe schemes', () => {
    const urls = [
      // eslint-disable-next-line no-script-url, sonarjs/code-eval
      'javascript:alert(1)',
      // eslint-disable-next-line no-script-url, sonarjs/code-eval
      'javascript:void(0)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox',
      'file:///etc/passwd',
    ];
    for (const url of urls) {
      expect(isSafeHttpUrl(url)).toBe(false);
    }
  });

  it('should return false for null/undefined/empty', () => {
    expect(isSafeHttpUrl(null)).toBe(false);
    expect(isSafeHttpUrl(undefined)).toBe(false);
    expect(isSafeHttpUrl('')).toBe(false);
  });

  it('should return false for relative and protocol-relative URLs', () => {
    expect(isSafeHttpUrl('//evil.com')).toBe(false);
    expect(isSafeHttpUrl('/path/to/resource')).toBe(false);
    expect(isSafeHttpUrl('just-a-string')).toBe(false);
  });
});
