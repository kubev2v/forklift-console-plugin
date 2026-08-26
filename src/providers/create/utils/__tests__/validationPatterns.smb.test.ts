import { describe, expect, it } from '@jest/globals';

import { isValidSmbPath, NFS_PATH_REGEX } from '../validationPatterns';

describe('validationPatterns - smb/nfs', () => {
  it('validates NFS paths', () => {
    expect(NFS_PATH_REGEX.test('10.10.0.10:/ova')).toBe(true);
    expect(NFS_PATH_REGEX.test('nfs-server.example.com:/data')).toBe(true);
    expect(NFS_PATH_REGEX.test('badpath')).toBe(false);
  });

  it('validates Unix and Windows SMB paths', () => {
    expect(isValidSmbPath('//server/share')).toBe(true);
    expect(isValidSmbPath('\\\\server\\share')).toBe(true);
    expect(isValidSmbPath('/server/share')).toBe(false);
    expect(isValidSmbPath('')).toBe(false);
  });
});
