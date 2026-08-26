import { describe, expect, it, jest } from '@jest/globals';

import { createScriptFieldValidation } from '../createScriptFieldValidation';

describe('createScriptFieldValidation - validation', () => {
  it('builds name deps and triggers all name fields', async () => {
    const trigger = jest.fn(async () => true);
    const validation = createScriptFieldValidation('scripts', trigger, () => []);

    expect(validation.nameDeps(2)).toEqual(['scripts.0.name', 'scripts.1.name']);
    await expect(validation.triggerAllNames(2)).resolves.toBe(true);
    expect(trigger).toHaveBeenCalledWith(['scripts.0.name', 'scripts.1.name']);
  });

  it('validateName returns true for unique names', () => {
    const scripts = [{ name: 'a' }, { name: 'b' }] as never[];
    const validation = createScriptFieldValidation('scripts', jest.fn(), () => scripts);

    expect(validation.validateName(0)('a')).toBe(true);
  });
});
