import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
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
    expect(mockK8sPatch.mock.calls[0][0].data[0].op).toBe('add');

    await onConfirmPreserveStaticIPs({
      newValue: false,
      resource: { metadata: { name: 'p' }, spec: { preserveStaticIPs: true } } as never,
    });
    expect(mockK8sPatch.mock.calls[1][0].data[0].op).toBe('replace');
  });
});
