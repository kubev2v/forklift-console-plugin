import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { onConfirmTargetPowerState, onConfirmVmTargetPowerState } from '../utils';

describe('TargetPowerState utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({ metadata: { name: 'plan' } });
  });

  it('ADDs plan target power state when missing', async () => {
    const resource = { metadata: { name: 'plan' }, spec: {} } as never;
    await onConfirmTargetPowerState({ newValue: 'on', resource });
    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual({
      op: 'add',
      path: '/spec/targetPowerState',
      value: 'on',
    });
  });

  it('REPLACEs VM target power state by index', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { targetPowerState: 'off', vms: [{ name: 'vm', targetPowerState: 'off' }] },
    } as never;

    await onConfirmVmTargetPowerState(0)({ newValue: 'on', resource });

    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/vms/0/targetPowerState',
      value: 'on',
    });
  });
});
