import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
  patchVMTargetName,
} from '../utils';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn((...args: unknown[]) => mockK8sPatch(...args)),
}));

const plan = {
  metadata: { name: 'plan-1' },
  spec: {
    vms: [
      { name: 'vm-0' },
      {
        name: 'vm-1',
        networkNameTemplate: 'net-{{name}}',
        pvcNameTemplate: 'pvc-{{name}}',
        targetName: 'existing-target',
        volumeNameTemplate: 'vol-{{name}}',
      },
    ],
  },
} as unknown as V1beta1Plan;

describe('VM template / targetName patch helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockResolvedValue(plan);
  });

  it.each([
    ['network', onConfirmVirtualMachineNetworkNameTemplate, 'networkNameTemplate'],
    ['volume', onConfirmVirtualMachineVolumeNameTemplate, 'volumeNameTemplate'],
    ['pvc', onConfirmVirtualMachinePVCNameTemplate, 'pvcNameTemplate'],
  ] as const)('uses add for missing %s template and replace when present', async (_label, factory, field) => {
    await factory(0)({ newValue: 'tmpl-a', resource: plan });
    expect(mockK8sPatch.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        data: [{ op: 'add', path: `/spec/vms/0/${field}`, value: 'tmpl-a' }],
      }),
    );

    await factory(1)({ newValue: 'tmpl-b', resource: plan });
    expect(mockK8sPatch.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        data: [{ op: 'replace', path: `/spec/vms/1/${field}`, value: 'tmpl-b' }],
      }),
    );
  });

  it('passes undefined value when newValue is undefined for templates', async () => {
    await onConfirmVirtualMachineNetworkNameTemplate(1)({
      newValue: undefined,
      resource: plan,
    });
    expect(mockK8sPatch.mock.calls[0][0].data[0].value).toBeUndefined();
  });

  it('adds targetName when missing, replaces when present, removes when empty', async () => {
    await patchVMTargetName({ newValue: 'new-name', resource: plan, vmIndex: 0 });
    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual({
      op: 'add',
      path: '/spec/vms/0/targetName',
      value: 'new-name',
    });

    await patchVMTargetName({ newValue: 'renamed', resource: plan, vmIndex: 1 });
    expect(mockK8sPatch.mock.calls[1][0].data[0]).toEqual({
      op: 'replace',
      path: '/spec/vms/1/targetName',
      value: 'renamed',
    });

    await patchVMTargetName({ newValue: '', resource: plan, vmIndex: 1 });
    expect(mockK8sPatch.mock.calls[2][0].data[0]).toEqual({
      op: 'remove',
      path: '/spec/vms/1/targetName',
      value: '',
    });
  });
});
