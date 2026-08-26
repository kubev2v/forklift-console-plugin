import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { onConfirmTargetNamespace } from '../utils';

describe('PlanTargetNamespace utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches targetNamespace', async () => {
    await onConfirmTargetNamespace({
      newValue: 'ns-2',
      resource: { metadata: { name: 'p' }, spec: { targetNamespace: 'ns-1' } } as never,
    });
    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual(
      expect.objectContaining({ path: '/spec/targetNamespace', value: 'ns-2' }),
    );
  });
});
