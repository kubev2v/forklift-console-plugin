import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { onConfirmPreserveCpuModel } from '../utils';

describe('PreserveClusterCpuModel utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches preserveClusterCpuModel with ADD when unset', async () => {
    await onConfirmPreserveCpuModel({
      newValue: true,
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'add',
      path: '/spec/preserveClusterCpuModel',
      value: true,
    });
  });

  it('stores undefined when disabling', async () => {
    await onConfirmPreserveCpuModel({
      newValue: false,
      resource: { metadata: { name: 'p' }, spec: { preserveClusterCpuModel: true } } as never,
    });
    expect(
      (mockK8sPatch.mock.calls[0] as unknown as [{ data: { value: unknown }[] }])[0].data[0].value,
    ).toBeUndefined();
  });
});
