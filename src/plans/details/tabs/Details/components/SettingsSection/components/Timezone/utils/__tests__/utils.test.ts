import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { onConfirmTimezone } from '../utils';

const mockK8sPatch = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

jest.mock('@utils/crds/plans/selectors', () => ({
  getPlanTimezone: (plan: V1beta1Plan) =>
    (plan?.spec as unknown as Record<string, unknown>)?.timezone as string | undefined,
}));

const basePlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Plan;

const planWithTimezone = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: { timezone: 'UTC' },
} as unknown as V1beta1Plan;

describe('onConfirmTimezone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockResolvedValue(basePlan);
  });

  it('uses add op when setting timezone on a plan without one', async () => {
    await onConfirmTimezone({ newValue: 'America/New_York', resource: basePlan });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/timezone', value: 'America/New_York' }],
      model: expect.anything(),
      resource: basePlan,
    });
  });

  it('uses replace op when changing an existing timezone', async () => {
    await onConfirmTimezone({ newValue: 'Europe/London', resource: planWithTimezone });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/timezone', value: 'Europe/London' }],
      model: expect.anything(),
      resource: planWithTimezone,
    });
  });

  it('uses remove op when clearing timezone', async () => {
    await onConfirmTimezone({ newValue: '', resource: planWithTimezone });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'remove', path: '/spec/timezone' }],
      model: expect.anything(),
      resource: planWithTimezone,
    });
  });
});
