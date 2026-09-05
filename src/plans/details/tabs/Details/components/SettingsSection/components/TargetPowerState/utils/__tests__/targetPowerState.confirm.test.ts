import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { onConfirmTargetPowerState, onConfirmVmTargetPowerState } from '../utils';

describe('TargetPowerState utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({ metadata: { name: 'plan' } });
  });

  it('ADDs plan target power state when missing', async () => {
    const resource = { metadata: { name: 'plan' }, spec: {} } as never;

    await onConfirmTargetPowerState({ newValue: 'on', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/targetPowerState', value: 'on' }],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs plan target power state when already set', async () => {
    const resource = { metadata: { name: 'plan' }, spec: { targetPowerState: 'off' } } as never;

    await onConfirmTargetPowerState({ newValue: 'on', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/targetPowerState', value: 'on' }],
      model: PlanModel,
      resource,
    });
  });

  it('ADDs VM target power state when missing', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { vms: [{ name: 'vm' }] },
    } as never;

    await onConfirmVmTargetPowerState(0)({ newValue: 'on', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/vms/0/targetPowerState', value: 'on' }],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs VM target power state by index', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { targetPowerState: 'off', vms: [{ name: 'vm', targetPowerState: 'off' }] },
    } as never;

    await onConfirmVmTargetPowerState(0)({ newValue: 'on', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/vms/0/targetPowerState', value: 'on' }],
      model: PlanModel,
      resource,
    });
  });
});
