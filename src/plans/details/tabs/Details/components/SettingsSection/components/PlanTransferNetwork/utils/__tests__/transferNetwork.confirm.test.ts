import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { PROVIDER_DEFAULTS } from '../constants';
import { getNetworkName, onConfirmTransferNetwork } from '../utils';

describe('PlanTransferNetwork utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('formats network names and defaults', () => {
    expect(getNetworkName(null)).toBe(PROVIDER_DEFAULTS);
    expect(getNetworkName({ name: 'net', namespace: 'ns' })).toBe('ns/net');
  });

  it('ADDs transfer network with name and namespace', async () => {
    const resource = { metadata: { name: 'plan' }, spec: {} } as never;

    await onConfirmTransferNetwork({
      newValue: { name: 'net', namespace: 'ns' },
      resource,
    });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: 'add',
          path: '/spec/transferNetwork',
          value: { name: 'net', namespace: 'ns' },
        },
      ],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs transfer network with undefined when clearing', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { transferNetwork: { name: 'old', namespace: 'ns' } },
    } as never;

    await onConfirmTransferNetwork({ newValue: null, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/transferNetwork', value: undefined }],
      model: PlanModel,
      resource,
    });
  });
});
