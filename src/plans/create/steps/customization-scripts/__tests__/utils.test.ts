import { describe, expect, it } from '@jest/globals';

import { GuestType, ScriptType } from '../constants';
import type { CustomScript } from '../types';
import {
  buildConfigMapKey,
  isScriptConfigMap,
  scriptsToConfigMapData,
  validateScriptName,
  validateUniqueScriptKey,
} from '../utils';

const createScript = (overrides: Partial<CustomScript> = {}): CustomScript => ({
  content: '#!/bin/bash\necho hello',
  guestType: GuestType.Linux,
  name: 'setup-network',
  scriptType: ScriptType.Firstboot,
  ...overrides,
});

describe('buildConfigMapKey', () => {
  it('builds a Linux firstboot key with customer prefix', () => {
    const script = createScript();
    expect(buildConfigMapKey(script)).toBe('99999_linux_firstboot_setup-network.sh');
  });

  it('builds a Windows firstboot key', () => {
    const script = createScript({ guestType: GuestType.Windows, scriptType: ScriptType.Firstboot });
    expect(buildConfigMapKey(script)).toBe('99999_win_firstboot_setup-network.ps1');
  });

  it('builds a Linux run key', () => {
    const script = createScript({ scriptType: ScriptType.Run });
    expect(buildConfigMapKey(script)).toBe('99999_linux_run_setup-network.sh');
  });
});

describe('scriptsToConfigMapData', () => {
  it('converts multiple scripts to ConfigMap data entries', () => {
    const scripts = [
      createScript({ name: 'first' }),
      createScript({ name: 'second', scriptType: ScriptType.Run }),
    ];

    const result = scriptsToConfigMapData(scripts);

    expect(result).toEqual({
      '99999_linux_firstboot_first.sh': '#!/bin/bash\necho hello',
      '99999_linux_run_second.sh': '#!/bin/bash\necho hello',
    });
  });

  it('returns an empty object for an empty array', () => {
    expect(scriptsToConfigMapData([])).toEqual({});
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

describe('validateUniqueScriptKey', () => {
  it('returns undefined when all scripts produce unique keys', () => {
    const scripts = [createScript({ name: 'init' }), createScript({ name: 'cleanup' })];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeUndefined();
    expect(validateUniqueScriptKey(scripts[1], 1, scripts)).toBeUndefined();
  });

  it('returns error when two scripts have the same name, guestType, and scriptType', () => {
    const scripts = [createScript({ name: 'init' }), createScript({ name: 'init' })];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeDefined();
    expect(validateUniqueScriptKey(scripts[1], 1, scripts)).toBeDefined();
  });

  it('allows same name with different guestType', () => {
    const scripts = [
      createScript({ guestType: GuestType.Linux, name: 'init' }),
      createScript({ guestType: GuestType.Windows, name: 'init' }),
    ];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeUndefined();
    expect(validateUniqueScriptKey(scripts[1], 1, scripts)).toBeUndefined();
  });

  it('allows same name with different scriptType', () => {
    const scripts = [
      createScript({ name: 'init', scriptType: ScriptType.Firstboot }),
      createScript({ name: 'init', scriptType: ScriptType.Run }),
    ];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeUndefined();
    expect(validateUniqueScriptKey(scripts[1], 1, scripts)).toBeUndefined();
  });

  it('returns format error for invalid script name', () => {
    const scripts = [createScript({ name: '-invalid' })];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeDefined();
  });

  it('returns required error for empty script name', () => {
    const scripts = [createScript({ name: '' })];
    expect(validateUniqueScriptKey(scripts[0], 0, scripts)).toBeDefined();
  });
});

describe('isScriptConfigMap', () => {
  it('returns true for a Linux script key', () => {
    const data = { '99999_linux_firstboot_setup.sh': '#!/bin/bash' };
    expect(isScriptConfigMap(data)).toBe(true);
  });

  it('returns true for a Windows script key', () => {
    const data = { '99999_win_run_cleanup.ps1': 'Remove-Item' };
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
