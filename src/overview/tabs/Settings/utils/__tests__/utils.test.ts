import { type EnhancedForkliftController, SettingsFields } from '../types';
import { getDefaultValues } from '../utils';

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
