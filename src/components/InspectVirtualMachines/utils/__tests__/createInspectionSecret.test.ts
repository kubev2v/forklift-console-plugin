jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createInspectionSecret } from '../createInspectionSecret';

describe('createInspectionSecret', () => {
  it('base64-encodes passphrases and creates an Opaque secret', async () => {
    (k8sCreate as jest.Mock).mockResolvedValue({ metadata: { name: 'secret' } });

    await createInspectionSecret(['p1', 'p2'], 'vm-a', 'ns-a');

    expect(k8sCreate).toHaveBeenCalledWith({
      data: {
        data: {
          '0': btoa('p1'),
          '1': btoa('p2'),
        },
        metadata: {
          generateName: 'inspect-luks-vm-a-',
          namespace: 'ns-a',
        },
        type: 'Opaque',
      },
      model: expect.objectContaining({ kind: 'Secret' }),
    });
  });
});
