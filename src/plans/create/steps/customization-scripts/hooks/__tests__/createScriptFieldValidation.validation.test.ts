import { describe, expect, it, jest } from '@jest/globals';

import { GuestType, ScriptType } from '../../constants';
import type { CustomScript } from '../../types';
import { createScriptFieldValidation } from '../createScriptFieldValidation';

const createScript = (overrides: Partial<CustomScript> = {}): CustomScript => ({
  content: '#!/bin/bash\necho hello',
  guestType: GuestType.Linux,
  name: 'setup-network',
  scriptType: ScriptType.Firstboot,
  ...overrides,
});

describe('createScriptFieldValidation', () => {
  it('builds name deps and triggers all name fields', async () => {
    const trigger = jest.fn((_name?: string | string[]) => Promise.resolve(true));
    const validation = createScriptFieldValidation('scripts', trigger, () => []);

    expect(validation.nameDeps(2)).toEqual(['scripts.0.name', 'scripts.1.name']);
    await expect(validation.triggerAllNames(2)).resolves.toBe(true);
    expect(trigger).toHaveBeenCalledWith(['scripts.0.name', 'scripts.1.name']);
  });

  it('validateName returns true for unique names', () => {
    const scripts = [createScript({ name: 'a' }), createScript({ name: 'b' })];
    const trigger = jest.fn((_name?: string | string[]) => Promise.resolve(true));
    const validation = createScriptFieldValidation('scripts', trigger, () => scripts);

    expect(validation.validateName(0)('a')).toBe(true);
  });

  it('validateName returns an error string for duplicate names', () => {
    const scripts = [createScript({ name: 'init' }), createScript({ name: 'init' })];
    const trigger = jest.fn((_name?: string | string[]) => Promise.resolve(true));
    const validation = createScriptFieldValidation('scripts', trigger, () => scripts);

    expect(validation.validateName(0)('init')).toEqual(expect.any(String));
  });

  it('validateName returns an error string for invalid names', () => {
    const scripts = [createScript({ name: 'valid' })];
    const trigger = jest.fn((_name?: string | string[]) => Promise.resolve(true));
    const validation = createScriptFieldValidation('scripts', trigger, () => scripts);

    expect(validation.validateName(0)('-invalid')).toEqual(expect.any(String));
  });
});
