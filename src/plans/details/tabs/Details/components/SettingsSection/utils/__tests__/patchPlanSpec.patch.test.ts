import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { patchPlanSpec } from '../patchPlanSpec';

describe('patchPlanSpec - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({ metadata: { name: 'plan' } });
  });

  it('uses ADD when current value is undefined', async () => {
    const plan = { metadata: { name: 'plan' } } as never;
    await patchPlanSpec({ currentValue: undefined, newValue: true, path: '/spec/flag', plan });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/flag', value: true }],
      model: PlanModel,
      resource: plan,
    });
  });

  it('uses REPLACE when current value is defined', async () => {
    const plan = { metadata: { name: 'plan' } } as never;
    await patchPlanSpec({ currentValue: false, newValue: true, path: '/spec/flag', plan });
    expect(mockK8sPatch.mock.calls[0][0].data[0].op).toBe('replace');
  });
});
