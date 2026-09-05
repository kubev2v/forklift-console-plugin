import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { onConfirmPreserveStaticIPs } from '../utils';

describe('PreserveStaticIPs utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('ADDs preserveStaticIPs with true', async () => {
    const resource = { metadata: { name: 'p' }, spec: {} } as never;

    await onConfirmPreserveStaticIPs({ newValue: true, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/preserveStaticIPs', value: true }],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs preserveStaticIPs keeping false', async () => {
    const resource = { metadata: { name: 'p' }, spec: { preserveStaticIPs: true } } as never;

    await onConfirmPreserveStaticIPs({ newValue: false, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/preserveStaticIPs', value: false }],
      model: PlanModel,
      resource,
    });
  });
});
