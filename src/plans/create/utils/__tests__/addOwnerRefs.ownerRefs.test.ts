import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn(),
}));

import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { addOwnerRefs } from '../addOwnerRefs';

const mockK8sPatch = k8sPatch as unknown as jest.Mock;
const model = { kind: 'Secret', apiVersion: 'v1' } as never;
const planRef = { apiVersion: 'v1', kind: 'Plan', name: 'plan-1', uid: 'uid-1' };

describe('addOwnerRefs - ownerRefs', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({} as never);
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

    const [firstCall] = mockK8sPatch.mock.calls;
    const [patchArg] = firstCall as [{ data: { value: unknown[] }[] }];
    const [{ value }] = patchArg.data;
    expect(value).toHaveLength(2);
    expect(value[0]).toEqual({ ...existing, namespace: undefined });
    expect(value[1]).toEqual({ ...planRef, namespace: undefined });
  });
});
