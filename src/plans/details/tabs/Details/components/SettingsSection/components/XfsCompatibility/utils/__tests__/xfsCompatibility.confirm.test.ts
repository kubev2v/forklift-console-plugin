import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn() as jest.Mock;

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
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
    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual({
      op: 'add',
      path: '/spec/xfsCompatibility',
      value: false,
    });
  });
});
