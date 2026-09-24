import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import {
  getNameTemplateOverrideVms,
  getVmNameTemplateActionDescription,
  NAME_TEMPLATE_TYPE,
  removeVmNameTemplateFromAllVms,
} from '../nameTemplateOverrides';

const createPlan = (vms: Record<string, unknown>[]): V1beta1Plan =>
  ({
    metadata: { name: 'test-plan', namespace: 'test-ns' },
    spec: { vms },
  }) as unknown as V1beta1Plan;

describe('getNameTemplateOverrideVms', () => {
  it('returns an empty list when the plan has no VMs', () => {
    expect(getNameTemplateOverrideVms(createPlan([]), NAME_TEMPLATE_TYPE.pvc)).toEqual([]);
  });

  it('returns an empty list when spec.vms is missing', () => {
    const plan = { metadata: { name: 'test-plan' }, spec: {} } as unknown as V1beta1Plan;

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.volume)).toEqual([]);
  });

  it('treats unset and empty VM fields as inherit, not overrides', () => {
    const plan = createPlan([
      { id: 'vm-1', name: 'alpha' },
      { id: 'vm-2', name: 'beta', pvcNameTemplate: '' },
    ]);

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc)).toEqual([]);
  });

  it('treats a non-empty VM field as an override even when it matches the plan template', () => {
    const plan = {
      metadata: { name: 'test-plan' },
      spec: {
        pvcNameTemplate: 'plan-{{.VmName}}',
        vms: [{ name: 'alpha', pvcNameTemplate: 'plan-{{.VmName}}' }],
      },
    } as unknown as V1beta1Plan;

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc)).toEqual(['alpha']);
  });

  it('returns only VMs that override the requested template type', () => {
    const plan = createPlan([
      { name: 'alpha', pvcNameTemplate: 'pvc-alpha' },
      { name: 'beta', volumeNameTemplate: 'vol-beta' },
      { name: 'gamma', networkNameTemplate: 'net-gamma', pvcNameTemplate: 'pvc-gamma' },
    ]);

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc)).toEqual(['alpha', 'gamma']);
    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.volume)).toEqual(['beta']);
    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.network)).toEqual(['gamma']);
  });

  it('falls back to id or index when a VM has no name', () => {
    const plan = createPlan([
      { id: 'vm-id-1', pvcNameTemplate: 'pvc-a' },
      { pvcNameTemplate: 'pvc-b' },
    ]);

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc)).toEqual(['vm-id-1', '1']);
  });

  it('is provider-agnostic; vSphere gating stays at Settings and kebab call sites', () => {
    const plan = createPlan([{ name: 'alpha', pvcNameTemplate: 'pvc-a' }]);

    expect(getNameTemplateOverrideVms(plan, NAME_TEMPLATE_TYPE.pvc)).toEqual(['alpha']);
  });
});

describe('getVmNameTemplateActionDescription', () => {
  it('returns Use default when the VM inherits the plan template', () => {
    expect(getVmNameTemplateActionDescription()).toBe('Use default');
    expect(getVmNameTemplateActionDescription('')).toBe('Use default');
  });

  it('returns Use custom with the template string when the VM overrides', () => {
    expect(getVmNameTemplateActionDescription('frontend-vm03-net')).toBe(
      'Use custom (frontend-vm03-net)',
    );
  });
});

describe('removeVmNameTemplateFromAllVms', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('does not patch when no VMs have the field', async () => {
    const plan = createPlan([{ name: 'alpha' }, { name: 'beta', volumeNameTemplate: 'vol' }]);

    const result = await removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.pvc);

    expect(result).toBe(plan);
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });

  it('sends a batch REMOVE for every VM that has the field', async () => {
    const plan = createPlan([
      { name: 'alpha', pvcNameTemplate: 'pvc-a' },
      { name: 'beta' },
      { name: 'gamma', pvcNameTemplate: 'pvc-c', volumeNameTemplate: 'vol-c' },
    ]);

    await removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.pvc);

    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { op: 'remove', path: '/spec/vms/0/pvcNameTemplate' },
          { op: 'remove', path: '/spec/vms/2/pvcNameTemplate' },
        ],
      }),
    );
  });

  it('does not REPLACE the field with undefined', async () => {
    const plan = createPlan([{ name: 'alpha', networkNameTemplate: 'net-a' }]);

    await removeVmNameTemplateFromAllVms(plan, NAME_TEMPLATE_TYPE.network);

    const [arg] = mockK8sPatch.mock.calls[0] as unknown as [
      { data: { op: string; path: string; value?: unknown }[] },
    ];

    expect(arg.data[0]).toEqual({ op: 'remove', path: '/spec/vms/0/networkNameTemplate' });
    expect(arg.data[0]).not.toHaveProperty('value');
  });
});
