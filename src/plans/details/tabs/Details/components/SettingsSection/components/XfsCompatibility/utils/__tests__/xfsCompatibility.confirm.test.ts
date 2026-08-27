import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { getPlanXfsCompatibility, onConfirmXfsCompatibility } from '../utils';

describe('XfsCompatibility utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('reads and patches xfsCompatibility', async () => {
    expect(getPlanXfsCompatibility({ spec: { xfsCompatibility: true } } as never)).toBe(true);
    await onConfirmXfsCompatibility({
      newValue: false,
      resource: { metadata: { name: 'p' }, spec: {} } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual({
      op: 'add',
      path: '/spec/xfsCompatibility',
      value: false,
    });
  });
});
