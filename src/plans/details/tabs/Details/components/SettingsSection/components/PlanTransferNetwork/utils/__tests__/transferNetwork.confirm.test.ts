import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { PROVIDER_DEFAULTS } from '../constants';
import { getNetworkName, onConfirmTransferNetwork } from '../utils';

describe('PlanTransferNetwork utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('formats network names and defaults', () => {
    expect(getNetworkName(null)).toBe(PROVIDER_DEFAULTS);
    expect(getNetworkName({ name: 'net', namespace: 'ns' } as never)).toBe('ns/net');
  });

  it('patches transfer network with ADD/REPLACE', async () => {
    const empty = { metadata: { name: 'plan' }, spec: {} } as never;
    await onConfirmTransferNetwork({
      newValue: { name: 'net', namespace: 'ns' } as never,
      resource: empty,
    });
    expect(mockK8sPatch.mock.calls[0][0].data[0].op).toBe('add');

    const existing = {
      metadata: { name: 'plan' },
      spec: { transferNetwork: { name: 'old', namespace: 'ns' } },
    } as never;
    await onConfirmTransferNetwork({ newValue: null, resource: existing });
    expect(mockK8sPatch.mock.calls[1][0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/transferNetwork',
      value: undefined,
    });
  });
});
