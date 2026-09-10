import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { onConfirmPreserveCpuModel } from '../utils';

describe('PreserveClusterCpuModel utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches preserveClusterCpuModel with ADD when unset', async () => {
    const resource = { metadata: { name: 'p' }, spec: {} } as never;

    await onConfirmPreserveCpuModel({ newValue: true, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/preserveClusterCpuModel', value: true }],
      model: PlanModel,
      resource,
    });
  });

  it('stores undefined when disabling', async () => {
    const resource = {
      metadata: { name: 'p' },
      spec: { preserveClusterCpuModel: true },
    } as never;

    await onConfirmPreserveCpuModel({ newValue: false, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/preserveClusterCpuModel', value: undefined }],
      model: PlanModel,
      resource,
    });
  });
});
