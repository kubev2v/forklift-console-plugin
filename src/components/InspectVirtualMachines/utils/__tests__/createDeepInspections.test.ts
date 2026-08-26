jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import type { V1beta1Provider } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { processDeepInspections } from '../createDeepInspections';

const provider = {
  metadata: { name: 'p', namespace: 'ns', uid: 'uid' },
  spec: { secret: { name: 's', namespace: 'ns' }, type: 'vsphere' },
} as unknown as V1beta1Provider;

describe('processDeepInspections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('collects succeeded and failed creates', async () => {
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
  });

  it('returns empty results for empty input', async () => {
    await expect(processDeepInspections([], provider)).resolves.toEqual({
      failed: [],
      succeeded: [],
    });
    expect(k8sCreate).not.toHaveBeenCalled();
  });
});
