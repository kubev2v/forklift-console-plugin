import {
  type EnhancedForkliftController,
  type ForkliftSettingsValues,
  SettingsFields,
} from '../types';
import { buildSettingsPatches, getDefaultValues } from '../utils';

const MOCK_CONTROLLER = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'ForkliftController',
  metadata: { name: 'forklift-controller', namespace: 'openshift-mtv' },
  spec: {},
} as unknown as EnhancedForkliftController;

describe('getDefaultValues', () => {
  it('returns default 0 for virt_v2v_memsize when controller has no value', () => {
    const result = getDefaultValues(MOCK_CONTROLLER);
    expect(result[SettingsFields.VirtV2vMemsize]).toBe(0);
  });

  it('returns default 0 for virt_v2v_smp when controller has no value', () => {
    const result = getDefaultValues(MOCK_CONTROLLER);
    expect(result[SettingsFields.VirtV2vSmp]).toBe(0);
  });

  it('uses controller spec value for virt_v2v_memsize when set', () => {
    const controller = {
      ...MOCK_CONTROLLER,
      spec: { ...MOCK_CONTROLLER.spec, [SettingsFields.VirtV2vMemsize]: 4096 },
    } as unknown as EnhancedForkliftController;

    const result = getDefaultValues(controller);
    expect(result[SettingsFields.VirtV2vMemsize]).toBe(4096);
  });

  it('uses controller spec value for virt_v2v_smp when set', () => {
    const controller = {
      ...MOCK_CONTROLLER,
      spec: { ...MOCK_CONTROLLER.spec, [SettingsFields.VirtV2vSmp]: 8 },
    } as unknown as EnhancedForkliftController;

    const result = getDefaultValues(controller);
    expect(result[SettingsFields.VirtV2vSmp]).toBe(8);
  });

  it('returns defaults for all fields when no controller is provided', () => {
    const result = getDefaultValues();
    expect(result[SettingsFields.VirtV2vMemsize]).toBe(0);
    expect(result[SettingsFields.VirtV2vSmp]).toBe(0);
    expect(result[SettingsFields.MaxVMInFlight]).toBe(20);
  });
});

describe('buildSettingsPatches', () => {
  it('emits REPLACE when field has existing spec value', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.MaxVMInFlight]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.MaxVMInFlight]: 30 };
    const currentSpec = { [SettingsFields.MaxVMInFlight]: 20 };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([
      { op: 'replace', path: '/spec/controller_max_vm_inflight', value: 30 },
    ]);
  });

  it('emits ADD when field is new (not in current spec)', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.MaxVMInFlight]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.MaxVMInFlight]: 10 };

    const patches = buildSettingsPatches(dirtyFields, formData, undefined);
    expect(patches).toEqual([{ op: 'add', path: '/spec/controller_max_vm_inflight', value: 10 }]);
  });

  it('emits REMOVE when value is undefined', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.AapUrl]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.AapUrl]: undefined };
    const currentSpec = { [SettingsFields.AapUrl]: 'https://old.example.com' };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([{ op: 'remove', path: '/spec/aap_url' }]);
  });

  it('emits REMOVE when value is empty string', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.AapUrl]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.AapUrl]: '' };
    const currentSpec = { [SettingsFields.AapUrl]: 'https://old.example.com' };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([{ op: 'remove', path: '/spec/aap_url' }]);
  });

  it('emits REMOVE for virt_v2v_memsize when value is 0', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.VirtV2vMemsize]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.VirtV2vMemsize]: 0 };
    const currentSpec = { [SettingsFields.VirtV2vMemsize]: 4096 };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([{ op: 'remove', path: '/spec/virt_v2v_memsize' }]);
  });

  it('emits REMOVE for virt_v2v_smp when value is 0', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.VirtV2vSmp]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.VirtV2vSmp]: 0 };
    const currentSpec = { [SettingsFields.VirtV2vSmp]: 8 };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([{ op: 'remove', path: '/spec/virt_v2v_smp' }]);
  });

  it('emits REMOVE for aap_timeout when value is 0', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.AapTimeout]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.AapTimeout]: 0 };
    const currentSpec = { [SettingsFields.AapTimeout]: 300 };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([{ op: 'remove', path: '/spec/aap_timeout' }]);
  });

  it('does NOT emit REMOVE for non-unsettable field when value is 0', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.MaxVMInFlight]: true,
    };
    const formData: ForkliftSettingsValues = { [SettingsFields.MaxVMInFlight]: 0 };
    const currentSpec = { [SettingsFields.MaxVMInFlight]: 20 };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toEqual([
      { op: 'replace', path: '/spec/controller_max_vm_inflight', value: 0 },
    ]);
  });

  it('builds patches only for dirty fields', () => {
    const dirtyFields: Partial<Record<keyof ForkliftSettingsValues, boolean>> = {
      [SettingsFields.ControllerCPULimit]: true,
      [SettingsFields.VirtV2vMemsize]: true,
    };
    const formData: ForkliftSettingsValues = {
      [SettingsFields.ControllerCPULimit]: '2000m',
      [SettingsFields.MaxVMInFlight]: 20,
      [SettingsFields.VirtV2vMemsize]: 0,
    };
    const currentSpec = {
      [SettingsFields.ControllerCPULimit]: '500m',
      [SettingsFields.MaxVMInFlight]: 20,
      [SettingsFields.VirtV2vMemsize]: 4096,
    };

    const patches = buildSettingsPatches(dirtyFields, formData, currentSpec);
    expect(patches).toHaveLength(2);
    expect(patches).toContainEqual({
      op: 'replace',
      path: '/spec/controller_container_limits_cpu',
      value: '2000m',
    });
    expect(patches).toContainEqual({
      op: 'remove',
      path: '/spec/virt_v2v_memsize',
    });
  });
});
