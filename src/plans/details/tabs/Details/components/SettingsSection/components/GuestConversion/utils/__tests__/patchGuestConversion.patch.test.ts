import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { patchGuestConversion } from '../patchGuestConversion';

describe('patchGuestConversion - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
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

  it('only patches skipGuestConversion when compatibility is omitted', async () => {
    const resource = { metadata: { name: 'plan' }, spec: {} } as never;

    await patchGuestConversion({ newValue: true, resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/skipGuestConversion', value: true }],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs skip and compatibility when already set', async () => {
    const resource = {
      metadata: { name: 'plan' },
      spec: { skipGuestConversion: false, useCompatibilityMode: false },
    } as never;

    await patchGuestConversion({
      newValue: true,
      resource,
      useCompatibilityMode: true,
    });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        { op: 'replace', path: '/spec/skipGuestConversion', value: true },
        { op: 'replace', path: '/spec/useCompatibilityMode', value: true },
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

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [
        { op: 'replace', path: '/spec/skipGuestConversion', value: false },
        { op: 'remove', path: '/spec/useCompatibilityMode' },
      ],
      model: PlanModel,
      resource,
    });
  });
});
