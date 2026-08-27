import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

import { onConfirmPVCNameTemplate } from '../utils';

describe('PVCNameTemplate utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches pvcNameTemplate', async () => {
    await onConfirmPVCNameTemplate({
      newValue: 'pvc-{{.vmName}}',
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect(mockK8sPatch.mock.calls[0][0].data[0].path).toBe('/spec/pvcNameTemplate');
  });
});
