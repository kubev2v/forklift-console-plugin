import { validateNFSMount } from 'src/utils/validation/common';

describe('validateNFSMount', () => {
  it('should validate correct NFS paths', () => {
    const validNFSPaths = [
      '10.10.0.10:/backups',
      '192.168.0.1:/exports',
      'my-nfs-server.com:/exports',
    ];

    for (const nfsPath of validNFSPaths) {
      expect(validateNFSMount(nfsPath)).toBe(true);
    }
  });

  it('should not validate incorrect NFS paths', () => {
    const invalidNFSPaths = [
      '10.10.0.10:backups',
      'my-nfs-server:/exports',
      '10.10.0.10:',
      'http://10.10.0.10:/backups', // NOSONAR
    ];

    for (const nfsPath of invalidNFSPaths) {
      expect(validateNFSMount(nfsPath)).toBe(false);
    }
  });
});
