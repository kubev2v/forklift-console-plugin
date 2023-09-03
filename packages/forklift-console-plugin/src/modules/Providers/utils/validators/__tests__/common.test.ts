/* eslint-disable @cspell/spellchecker */
import {
  validateContainerImage,
  validateFingerprint,
  validateK8sName,
  validateNFSMount,
  validatePublicCert,
  validateURL,
} from '../common';

describe('validator', () => {
  // Tests for validateContainerImage
  describe('validateContainerImage', () => {
    it('should return true for valid container images', () => {
      const images = [
        'my-registry/my-repo/my-image:my-tag',
        'localhost:5000/my-repo/my-image:my-tag',
        'my-repo/my-image@sha256:389d6e4ec6277e14d3684195be4d0531ff666ff8a8ee9e6bb56837dec642283f',
        'my-registry/my-repo/my-image',
      ];
      for (const image of images) {
        expect(validateContainerImage(image)).toBe(true);
      }
    });

    it('should return false for invalid container images', () => {
      const images = [
        'my-repo/my+image:my-tag', // invalid char
        'my-repo/my-image@sha256', // missing sha256 hash
      ];
      for (const image of images) {
        expect(validateContainerImage(image)).toBe(false);
      }
    });
  });

  // Tests for validateURL
  describe('validateURL', () => {
    it('should return true for valid URLs', () => {
      const urls = [
        'https://example.com:8080/my/path?param=value',
        'http://192.168.1.1:8000',
        'https://www.example.co.uk',
        'https://1.www.example.co.uk',
      ];
      for (const url of urls) {
        expect(validateURL(url)).toBe(true);
      }
    });

    it('should return false for invalid URLs', () => {
      const urls = [
        'http:/example.com', // missing slash
        'http://example', // no TLD
      ];
      for (const url of urls) {
        expect(validateURL(url)).toBe(false);
      }
    });
  });

  // Tests for validatePublicCert
  describe('validatePublicCert', () => {
    it('should return true for valid certificates', () => {
      const certs = [
        `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRtZSBXaWRn
-----END CERTIFICATE-----
        `,
      ];
      for (const ca of certs) {
        expect(validatePublicCert(ca.trim())).toBe(true);
      }
    });

    it('should return false for invalid certificates', () => {
      const certs = [
        `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRtZSBXaWRn
        `, // missing end tag
        `
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN 0YXRlMSEwHwYDVQQKDBhJ=
-----END CERTIFICATE-----
        `, // invalid Base64 content
        '-----BEGIN CERTIFICATE-----', // missing content and end tag
      ];
      for (const ca of certs) {
        expect(validatePublicCert(ca.trim())).toBe(false);
      }
    });
  });

  describe('validateFingerprint', () => {
    it('validates correct fingerprints', () => {
      const validFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
      expect(validateFingerprint(validFingerprint)).toBe(true);
    });

    it('invalidates fingerprints with wrong length', () => {
      const invalidFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08';
      expect(validateFingerprint(invalidFingerprint)).toBe(false);
    });

    it('invalidates fingerprints with wrong characters', () => {
      const invalidFingerprint = 'G2:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
      expect(validateFingerprint(invalidFingerprint)).toBe(false);
    });

    it('invalidates fingerprints with missing colons', () => {
      const invalidFingerprint = '526C4E881D78AE121CF3BB6C5BF4E28286A708AF';
      expect(validateFingerprint(invalidFingerprint)).toBe(false);
    });

    it('validates lowercase fingerprints', () => {
      const validFingerprint = '52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF';
      expect(validateFingerprint(validFingerprint)).toBe(true);
    });
  });

  describe('validateK8sName', () => {
    it('validates correct k8s names', () => {
      expect(validateK8sName('k8s-name')).toBe(true);
      expect(validateK8sName('k8s.name')).toBe(true);
      expect(validateK8sName('k8sname')).toBe(true);
      expect(validateK8sName('k8')).toBe(true);
      expect(validateK8sName('1a-k8')).toBe(true);
    });

    it('invalidates k8s names with invalid characters', () => {
      expect(validateK8sName('k8s_name')).toBe(false);
      expect(validateK8sName('k8s%name')).toBe(false);
      expect(validateK8sName('k8sname.')).toBe(false);
      expect(validateK8sName('.k8sname')).toBe(false);
      expect(validateK8sName('k8..sname')).toBe(false);
      expect(validateK8sName('k8.-sname')).toBe(false);
    });

    it('invalidates k8s names that are too long', () => {
      const longName = 'k'.repeat(254);
      expect(validateK8sName(longName)).toBe(false);
    });

    it('invalidates k8s names that start with a hyphen', () => {
      expect(validateK8sName('-k8sname')).toBe(false);
    });

    it('invalidates k8s names that end with a hyphen', () => {
      expect(validateK8sName('k8sname-')).toBe(false);
    });
  });

  describe('validateNFSMount', () => {
    it('should validate correct NFS paths', () => {
      const validNFSPaths = [
        '10.10.0.10:/backups',
        '192.168.0.1:/exports',
        'my-nfs-server.com:/exports',
      ];

      validNFSPaths.forEach((nfsPath) => {
        expect(validateNFSMount(nfsPath)).toBe(true);
      });
    });

    it('should not validate incorrect NFS paths', () => {
      const invalidNFSPaths = [
        '10.10.0.10:backups', // missing leading slash in path
        'my-nfs-server:/exports', // missing .com or similar in the hostname
        '10.10.0.10:', // missing path
        'http://10.10.0.10:/backups', // protocol included in the path
      ];

      invalidNFSPaths.forEach((nfsPath) => {
        expect(validateNFSMount(nfsPath)).toBe(false);
      });
    });
  });
});
