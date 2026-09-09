import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { PlanModel } from '@forklift-ui/types';

import { onConfirmTargetNamespace } from '../utils';

describe('PlanTargetNamespace utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('ADDs targetNamespace when unset', async () => {
    const resource = { metadata: { name: 'p' }, spec: {} } as never;

    await onConfirmTargetNamespace({ newValue: 'ns-2', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'add', path: '/spec/targetNamespace', value: 'ns-2' }],
      model: PlanModel,
      resource,
    });
  });

  it('REPLACEs targetNamespace when present', async () => {
    const resource = { metadata: { name: 'p' }, spec: { targetNamespace: 'ns-1' } } as never;

    await onConfirmTargetNamespace({ newValue: 'ns-2', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/targetNamespace', value: 'ns-2' }],
      model: PlanModel,
      resource,
    });
  });

  it('clears targetNamespace to undefined for empty string', async () => {
    const resource = { metadata: { name: 'p' }, spec: { targetNamespace: 'ns-1' } } as never;

    await onConfirmTargetNamespace({ newValue: '', resource });

    expect(mockK8sPatch).toHaveBeenCalledWith({
      data: [{ op: 'replace', path: '/spec/targetNamespace', value: undefined }],
      model: PlanModel,
      resource,
    });
  });
});
