import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { onConfirmPreserveStaticIPs } from '../utils';

describe('PreserveStaticIPs utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('ADDs then REPLACEs preserveStaticIPs', async () => {
    await onConfirmPreserveStaticIPs({
      newValue: true,
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect(
      (mockK8sPatch.mock.calls[0] as unknown as [{ data: { op: string }[] }])[0].data[0].op,
    ).toBe('add');

    await onConfirmPreserveStaticIPs({
      newValue: false,
      resource: { metadata: { name: 'p' }, spec: { preserveStaticIPs: true } } as never,
    });
    expect(
      (mockK8sPatch.mock.calls[1] as unknown as [{ data: { op: string }[] }])[0].data[0].op,
    ).toBe('replace');
  });
});
