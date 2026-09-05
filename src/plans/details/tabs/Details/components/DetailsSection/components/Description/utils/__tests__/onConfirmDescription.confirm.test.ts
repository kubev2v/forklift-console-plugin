import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { onConfirmDescription } from '../utils';

describe('Description utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('REPLACEs description when present', async () => {
    const resource = { metadata: { name: 'p' }, spec: { description: 'old' } } as never;

    await onConfirmDescription({ newValue: 'new', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/description', value: 'new' }],
      model: PlanModel,
      resource,
    });
  });

  it('trims description input before patching', async () => {
    const resource = { metadata: { name: 'p' }, spec: {} } as never;

    await onConfirmDescription({ newValue: '  new  ', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/description', value: 'new' }],
      model: PlanModel,
      resource,
    });
  });

  it('stores empty string for whitespace-only input', async () => {
    const resource = { metadata: { name: 'p' }, spec: { description: 'old' } } as never;

    await onConfirmDescription({ newValue: '   ', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/description', value: '' }],
      model: PlanModel,
      resource,
    });
  });
});
