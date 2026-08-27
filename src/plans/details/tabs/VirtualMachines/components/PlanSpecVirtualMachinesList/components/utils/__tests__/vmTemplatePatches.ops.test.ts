import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn(),
}));

import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  onConfirmVirtualMachineNetworkNameTemplate,
  onConfirmVirtualMachinePVCNameTemplate,
  onConfirmVirtualMachineVolumeNameTemplate,
  patchVMTargetName,
} from '../utils';

const mockK8sPatch = k8sPatch as jest.Mock;

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

type PatchArg = { data: { op: string; path: string; value?: unknown }[] };

const firstPatch = (callIndex: number): PatchArg => {
  const [arg] = mockK8sPatch.mock.calls[callIndex] as [PatchArg];
  return arg;
};

describe('VM template / targetName patch helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockImplementation(() => Promise.resolve(plan as never));
  });

  it.each([
    ['network', onConfirmVirtualMachineNetworkNameTemplate, 'networkNameTemplate'],
    ['volume', onConfirmVirtualMachineVolumeNameTemplate, 'volumeNameTemplate'],
    ['pvc', onConfirmVirtualMachinePVCNameTemplate, 'pvcNameTemplate'],
  ])(
    'uses add for missing %s template and replace when present',
    async (
      _label: string,
      factory: (
        vmIndex: number,
      ) => (args: { newValue: string | undefined; resource: V1beta1Plan }) => Promise<unknown>,
      field: string,
    ) => {
      await factory(0)({ newValue: 'tmpl-a', resource: plan });
      expect(firstPatch(0)).toEqual(
        expect.objectContaining({
          data: [{ op: 'add', path: `/spec/vms/0/${field}`, value: 'tmpl-a' }],
        }),
      );

      await factory(1)({ newValue: 'tmpl-b', resource: plan });
      expect(firstPatch(1)).toEqual(
        expect.objectContaining({
          data: [{ op: 'replace', path: `/spec/vms/1/${field}`, value: 'tmpl-b' }],
        }),
      );
    },
  );

  it('passes undefined value when newValue is undefined for templates', async () => {
    await onConfirmVirtualMachineNetworkNameTemplate(1)({
      newValue: undefined,
      resource: plan,
    });
    expect(firstPatch(0).data[0].value).toBeUndefined();
  });

  it('adds targetName when missing, replaces when present, removes when empty', async () => {
    await patchVMTargetName({ newValue: 'new-name', resource: plan, vmIndex: 0 });
    expect(firstPatch(0).data[0]).toEqual({
      op: 'add',
      path: '/spec/vms/0/targetName',
      value: 'new-name',
    });

    await patchVMTargetName({ newValue: 'renamed', resource: plan, vmIndex: 1 });
    expect(firstPatch(1).data[0]).toEqual({
      op: 'replace',
      path: '/spec/vms/1/targetName',
      value: 'renamed',
    });

    await patchVMTargetName({ newValue: '', resource: plan, vmIndex: 1 });
    expect(firstPatch(2).data[0]).toEqual({
      op: 'remove',
      path: '/spec/vms/1/targetName',
      value: '',
    });
  });
});
