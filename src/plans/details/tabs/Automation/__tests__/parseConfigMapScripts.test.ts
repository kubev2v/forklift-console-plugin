import { GuestType, ScriptType } from 'src/plans/create/steps/customization-scripts/constants';

import { describe, expect, it } from '@jest/globals';

import { parseConfigMapScripts } from '../utils/parseConfigMapScripts';

describe('parseConfigMapScripts', () => {
  it('parses a Linux firstboot script key', () => {
    const data = { '99999_linux_firstboot_setup-network.sh': '#!/bin/bash\necho hello' };
    const result = parseConfigMapScripts(data);

    expect(result).toEqual([
      {
        content: '#!/bin/bash\necho hello',
        guestType: GuestType.Linux,
        name: 'setup-network',
        scriptType: ScriptType.Firstboot,
      },
    ]);
  });

  it('parses a Windows firstboot script key', () => {
    const data = { '99999_win_firstboot_cleanup.ps1': 'Write-Host "cleanup complete"' };
    const result = parseConfigMapScripts(data);

    expect(result).toEqual([
      {
        content: 'Write-Host "cleanup complete"',
        guestType: GuestType.Windows,
        name: 'cleanup',
        scriptType: ScriptType.Firstboot,
      },
    ]);
  });

  it('parses a Linux run script key', () => {
    const data = { '99999_linux_run_remove-tools.sh': 'yum remove open-vm-tools' };
    const result = parseConfigMapScripts(data);

    expect(result).toEqual([
      {
        content: 'yum remove open-vm-tools',
        guestType: GuestType.Linux,
        name: 'remove-tools',
        scriptType: ScriptType.Run,
      },
    ]);
  });

  it('skips non-script keys', () => {
    const data = {
      '99999_linux_firstboot_setup.sh': 'echo setup',
      'some-other-key': 'ignored',
    };
    const result = parseConfigMapScripts(data);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('setup');
  });

  it('returns empty array for undefined data', () => {
    expect(parseConfigMapScripts(undefined)).toEqual([]);
  });

  it('returns empty array for data with no script keys', () => {
    expect(parseConfigMapScripts({ 'not-a-script': 'value' })).toEqual([]);
  });

  it('handles script names with underscores', () => {
    const data = { '99999_linux_firstboot_setup_my_network.sh': 'echo hi' };
    const result = parseConfigMapScripts(data);

    expect(result[0].name).toBe('setup_my_network');
  });
});
