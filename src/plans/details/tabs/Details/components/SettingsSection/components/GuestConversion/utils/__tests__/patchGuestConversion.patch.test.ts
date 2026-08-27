import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { patchGuestConversion } from '../patchGuestConversion';

describe('patchGuestConversion - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue(undefined as never);
  });

  it('adds skipGuestConversion and compatibility mode when skipping', async () => {
    const resource = { metadata: { name: 'plan' }, spec: {} } as never;

    await patchGuestConversion({
      newValue: true,
      resource,
      useCompatibilityMode: true,
    });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        { op: 'add', path: '/spec/skipGuestConversion', value: true },
        { op: 'add', path: '/spec/useCompatibilityMode', value: true },
      ],
      model: PlanModel,
      resource,
    });
  });

  it('removes compatibility mode when no longer skipping', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { skipGuestConversion: true, useCompatibilityMode: false },
    } as never;

    await patchGuestConversion({ newValue: false, resource });

    expect(mockK8sPatch.mock.calls[0][0].data).toEqual([
      { op: 'replace', path: '/spec/skipGuestConversion', value: false },
      { op: 'remove', path: '/spec/useCompatibilityMode' },
    ]);
  });
});
