import type { V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { onConfirmRootDisk } from '../utils';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn(),
}));

jest.mock('@utils/i18n', () => ({
  t: (key: string) => key,
}));

const mockPatch = k8sPatch as jest.MockedFunction<typeof k8sPatch>;

const planWithVms = {
  metadata: { name: 'plan-1', namespace: 'ns' },
  spec: {
    vms: [
      { id: 'vm-1', name: 'alpha' },
      { id: 'vm-2', name: 'bravo', rootDisk: '/dev/sda' },
    ],
  },
} as unknown as V1beta1Plan;

describe('onConfirmRootDisk - patch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockResolvedValue(planWithVms);
  });

  it('REPLACE-patches every VM with the new rootDisk', async () => {
    await onConfirmRootDisk(planWithVms, '/dev/sdb');

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'replace',
            path: '/spec/vms',
            value: [
              { id: 'vm-1', name: 'alpha', rootDisk: '/dev/sdb' },
              { id: 'vm-2', name: 'bravo', rootDisk: '/dev/sdb' },
            ],
          },
        ],
        resource: planWithVms,
      }),
    );
  });

  it('clears rootDisk when newValue is empty', async () => {
    await onConfirmRootDisk(planWithVms, '');

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'replace',
            path: '/spec/vms',
            value: [
              { id: 'vm-1', name: 'alpha', rootDisk: undefined },
              { id: 'vm-2', name: 'bravo', rootDisk: undefined },
            ],
          },
        ],
      }),
    );
  });

  it('REPLACE-patches an empty vms list (ADD branch is unreachable)', async () => {
    const emptyPlan = { metadata: { name: 'p' }, spec: {} } as unknown as V1beta1Plan;
    mockPatch.mockResolvedValue(emptyPlan);

    await onConfirmRootDisk(emptyPlan, '/dev/sda');

    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/vms', value: [] }],
      }),
    );
  });
});
