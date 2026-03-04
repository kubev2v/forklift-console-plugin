import { describe, expect, it } from '@jest/globals';

import { GuestType, ScriptType } from '../constants';
import type { CustomScript } from '../types';
import {
  buildConfigMapKey,
  getNextOrder,
  isScriptConfigMap,
  scriptsToConfigMapData,
  validateScriptName,
} from '../utils';

const createScript = (overrides: Partial<CustomScript> = {}): CustomScript => ({
  content: '#!/bin/bash\necho hello',
  guestType: GuestType.Linux,
  name: 'setup-network',
  order: 10,
  scriptType: ScriptType.Firstboot,
  ...overrides,
});

describe('buildConfigMapKey', () => {
  it('builds a Linux firstboot key', () => {
    const script = createScript();
    expect(buildConfigMapKey(script)).toBe('10_linux_firstboot_setup-network.sh');
  });

  it('builds a Windows firstboot key', () => {
    const script = createScript({ guestType: GuestType.Windows, scriptType: ScriptType.Firstboot });
    expect(buildConfigMapKey(script)).toBe('10_win_firstboot_setup-network.ps1');
  });

  it('builds a Linux run key', () => {
    const script = createScript({ scriptType: ScriptType.Run });
    expect(buildConfigMapKey(script)).toBe('10_linux_run_setup-network.sh');
  });

  it('zero-pads single-digit order numbers', () => {
    const script = createScript({ order: 5 });
    expect(buildConfigMapKey(script)).toBe('05_linux_firstboot_setup-network.sh');
  });
});

describe('scriptsToConfigMapData', () => {
  it('converts multiple scripts to ConfigMap data entries', () => {
    const scripts = [
      createScript({ name: 'first', order: 10 }),
      createScript({ name: 'second', order: 20, scriptType: ScriptType.Run }),
    ];

    const result = scriptsToConfigMapData(scripts);

    expect(result).toEqual({
      '10_linux_firstboot_first.sh': '#!/bin/bash\necho hello',
      '20_linux_run_second.sh': '#!/bin/bash\necho hello',
    });
  });

  it('returns an empty object for an empty array', () => {
    expect(scriptsToConfigMapData([])).toEqual({});
  });
});

describe('getNextOrder', () => {
  it('returns 10 for an empty array', () => {
    expect(getNextOrder([])).toBe(10);
  });

  it('increments by 10 from the highest order', () => {
    const scripts = [createScript({ order: 10 }), createScript({ order: 30 })];
    expect(getNextOrder(scripts)).toBe(40);
  });
});

describe('validateScriptName', () => {
  it('returns undefined for a valid name with hyphens', () => {
    expect(validateScriptName('setup-network')).toBeUndefined();
  });

  it('returns undefined for a valid name with underscores', () => {
    expect(validateScriptName('setup_network')).toBeUndefined();
  });

  it('rejects empty strings', () => {
    expect(validateScriptName('')).toBeDefined();
  });

  it('rejects names starting with a hyphen', () => {
    expect(validateScriptName('-invalid')).toBeDefined();
  });

  it('rejects uppercase characters', () => {
    expect(validateScriptName('Setup')).toBeDefined();
  });
});

describe('isScriptConfigMap', () => {
  it('returns true for a Linux script key', () => {
    const data = { '10_linux_firstboot_setup.sh': '#!/bin/bash' };
    expect(isScriptConfigMap(data)).toBe(true);
  });

  it('returns true for a Windows script key', () => {
    const data = { '05_win_run_cleanup.ps1': 'Remove-Item' };
    expect(isScriptConfigMap(data)).toBe(true);
  });

  it('returns false when no keys match', () => {
    const data = { 'some-other-key': 'value' };
    expect(isScriptConfigMap(data)).toBe(false);
  });

  it('returns false for undefined data', () => {
    expect(isScriptConfigMap(undefined)).toBe(false);
  });
});
