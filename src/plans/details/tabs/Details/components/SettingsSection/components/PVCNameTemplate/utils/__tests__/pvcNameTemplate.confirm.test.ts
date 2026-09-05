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

  it('ADDs pvcNameTemplate when unset', async () => {
    await onConfirmPVCNameTemplate({
      newValue: 'pvc-{{.vmName}}',
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'add',
      path: '/spec/pvcNameTemplate',
      value: 'pvc-{{.vmName}}',
    });
  });

  it('REPLACEs pvcNameTemplate when set', async () => {
    await onConfirmPVCNameTemplate({
      newValue: 'new-tpl',
      resource: { metadata: { name: 'p' }, spec: { pvcNameTemplate: 'old' } } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/pvcNameTemplate',
      value: 'new-tpl',
    });
  });
});
