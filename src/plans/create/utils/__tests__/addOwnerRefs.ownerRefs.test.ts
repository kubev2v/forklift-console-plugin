import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { addOwnerRefs } from '../addOwnerRefs';

const model = { kind: 'Secret', apiVersion: 'v1' } as never;
const planRef = { apiVersion: 'v1', kind: 'Plan', name: 'plan-1', uid: 'uid-1' };

describe('addOwnerRefs - ownerRefs', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('adds owner refs when none exist and strips namespace', async () => {
    const resource = { metadata: { name: 'sec' } } as never;

    await addOwnerRefs(model, resource, [planRef]);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'add',
            path: '/metadata/ownerReferences',
            value: [{ ...planRef, namespace: undefined }],
          },
        ],
        model,
        resource,
      }),
    );
  });

  it('appends to existing owner references', async () => {
    const existing = { apiVersion: 'v1', kind: 'Plan', name: 'old', uid: 'old-uid' };
    const resource = { metadata: { ownerReferences: [existing] } } as never;

    await addOwnerRefs(model, resource, [planRef]);

    const value = mockK8sPatch.mock.calls[0][0].data[0].value;
    expect(value).toHaveLength(2);
    expect(value[0]).toEqual({ ...existing, namespace: undefined });
    expect(value[1]).toEqual({ ...planRef, namespace: undefined });
  });
});
