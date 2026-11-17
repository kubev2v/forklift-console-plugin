import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';

import { PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH } from '../../constants';
import { onConfirmOffloadPopulatorPriorityClass } from '../utils';

const getPatchedOperations = (): Record<string, unknown>[] => {
  const [patchArg] = mockK8sPatch.mock.calls[0] as [{ data: Record<string, unknown>[] }];
  return patchArg.data;
};

const buildPlan = (priorityClassName?: string): V1beta1Plan =>
  ({
    metadata: { name: 'plan' },
    spec: priorityClassName ? { offloadPopulatorPriorityClassName: priorityClassName } : {},
  }) as never;

describe('onConfirmOffloadPopulatorPriorityClass', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('ADDs the priority class when the plan has no value', async () => {
    const resource = buildPlan();

    await onConfirmOffloadPopulatorPriorityClass({ newValue: 'high-priority', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: 'add',
          path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH,
          value: 'high-priority',
        },
      ],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs the priority class when a value already exists', async () => {
    const resource = buildPlan('low-priority');

    await onConfirmOffloadPopulatorPriorityClass({ newValue: 'high-priority', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: 'replace',
          path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH,
          value: 'high-priority',
        },
      ],
      model: PlanModel,
      resource,
    });
  });

  it('REMOVEs the priority class when the new value is empty', async () => {
    const resource = buildPlan('high-priority');

    await onConfirmOffloadPopulatorPriorityClass({ newValue: '', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: 'remove',
          path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH,
        },
      ],
      model: PlanModel,
      resource,
    });
    const [op] = getPatchedOperations();
    expect(op).not.toHaveProperty('value');
  });

  it('REMOVEs the priority class when the new value is undefined', async () => {
    const resource = buildPlan('high-priority');

    await onConfirmOffloadPopulatorPriorityClass({ resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        {
          op: 'remove',
          path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH,
        },
      ],
      model: PlanModel,
      resource,
    });
    const [op] = getPatchedOperations();
    expect(op).not.toHaveProperty('value');
  });

  it('does not patch when neither the plan nor the selection has a value', async () => {
    const resource = buildPlan();

    const result = await onConfirmOffloadPopulatorPriorityClass({ newValue: '', resource });

    expect(mockK8sPatch).not.toHaveBeenCalled();
    expect(result).toBe(resource);
  });
});
