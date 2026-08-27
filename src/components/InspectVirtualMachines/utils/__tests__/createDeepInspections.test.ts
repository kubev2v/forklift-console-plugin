jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import type { V1beta1Provider } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConversionModel } from '@utils/crds/common/models';
import { CONCURRENCY_LIMIT, DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';

import { processDeepInspections } from '../createDeepInspections';

const provider = {
  metadata: { name: 'p', namespace: 'ns', uid: 'uid' },
  spec: { secret: { name: 's', namespace: 'ns' }, type: 'vsphere' },
} as unknown as V1beta1Provider;

describe('processDeepInspections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (k8sCreate as jest.Mock).mockResolvedValue({ metadata: { name: 'ok' } });
  });

  it('collects succeeded and failed creates with Conversion payload', async () => {
    (k8sCreate as jest.Mock)
      .mockResolvedValueOnce({ metadata: { name: 'ok' } })
      .mockRejectedValueOnce(new Error('boom'));

    const result = await processDeepInspections(
      [
        { id: '1', name: 'vm-1' },
        { id: '2', name: 'vm-2' },
      ],
      provider,
    );

    expect(result.succeeded).toHaveLength(1);
    expect(result.failed).toEqual([{ error: expect.any(Error), vmId: '2' }]);
    expect(k8sCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({ generateName: 'deep-inspection-vm-1-' }),
          spec: expect.objectContaining({
            vm: expect.objectContaining({ id: '1', name: 'vm-1' }),
          }),
        }),
        model: ConversionModel,
      }),
    );
  });

  it('forwards plan, diskEncryption, and xfsCompatibility into the Conversion CR', async () => {
    const plan = { metadata: { name: 'plan-a', namespace: 'plan-ns', uid: 'plan-uid' } } as never;

    await processDeepInspections(
      [
        {
          diskEncryption: { type: DISK_ENCRYPTION_TYPE.CLEVIS },
          id: '10',
          name: 'encrypted',
          xfsCompatibility: true,
        },
      ],
      provider,
      plan,
    );

    expect(k8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            labels: expect.objectContaining({
              'plan-name': 'plan-a',
              'plan-namespace': 'plan-ns',
            }),
            namespace: 'plan-ns',
          }),
          spec: expect.objectContaining({
            diskEncryption: { type: DISK_ENCRYPTION_TYPE.CLEVIS },
            xfsCompatibility: true,
          }),
        }),
        model: ConversionModel,
      }),
    );
  });

  it('processes VMs in concurrency-limit chunks', async () => {
    const vms = Array.from({ length: CONCURRENCY_LIMIT + 2 }, (_, index) => ({
      id: String(index + 1),
      name: `vm-${index + 1}`,
    }));

    const result = await processDeepInspections(vms, provider);

    expect(k8sCreate).toHaveBeenCalledTimes(CONCURRENCY_LIMIT + 2);
    expect(result.succeeded).toHaveLength(CONCURRENCY_LIMIT + 2);
    expect(result.failed).toEqual([]);
  });

  it('returns empty results for empty input', async () => {
    await expect(processDeepInspections([], provider)).resolves.toEqual({
      failed: [],
      succeeded: [],
    });
    expect(k8sCreate).not.toHaveBeenCalled();
  });
});
