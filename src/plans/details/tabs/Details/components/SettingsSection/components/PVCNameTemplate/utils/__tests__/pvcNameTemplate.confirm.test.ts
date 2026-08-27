import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
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
    const [patchArg] = mockK8sPatch.mock.calls[0] as unknown as [{ data: { path: string }[] }];
    expect(patchArg.data[0].path).toBe('/spec/pvcNameTemplate');
  });
});
