import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { onConfirmPlanNetworkNameTemplate } from '../utils';

describe('NetworkNameTemplate utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('ADDs and REPLACEs networkNameTemplate', async () => {
    await onConfirmPlanNetworkNameTemplate({
      newValue: 'tpl',
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'add',
      path: '/spec/networkNameTemplate',
      value: 'tpl',
    });

    await onConfirmPlanNetworkNameTemplate({
      newValue: undefined,
      resource: { metadata: { name: 'p' }, spec: { networkNameTemplate: 'old' } } as never,
    });
    expect((mockK8sPatch.mock.calls[1] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/networkNameTemplate',
      value: undefined,
    });
  });
});
