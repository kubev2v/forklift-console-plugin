import { describe, expect, it } from '@jest/globals';

import { HooksFormFieldId, MigrationHookFieldId } from '../constants';
import {
  getEnableHookFieldLabel,
  getHooksSubFieldId,
  toAapSelectOptions,
  validateHookRunnerImage,
  validateHookServiceAccount,
} from '../utils';

describe('migration hooks utils - validation', () => {
  it('builds nested field ids and enable labels', () => {
    expect(getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.EnableHook)).toBe(
      `${HooksFormFieldId.PreMigration}.${MigrationHookFieldId.EnableHook}`,
    );
    expect(getEnableHookFieldLabel(HooksFormFieldId.PreMigration)).toMatch(/pre-migration/i);
    expect(getEnableHookFieldLabel(HooksFormFieldId.PostMigration)).toMatch(/post-migration/i);
  });

  it('validates hook runner image', () => {
    expect(validateHookRunnerImage('')).toMatch(/required/i);
    expect(validateHookRunnerImage('bad image')).toMatch(/Invalid container image/i);
    expect(validateHookRunnerImage('quay.io/org/image:tag')).toBeUndefined();
  });

  it('validates optional service account names', () => {
    expect(validateHookServiceAccount('')).toBeUndefined();
    expect(validateHookServiceAccount('Bad_SA')).toMatch(/lowercase alphanumeric/i);
    expect(validateHookServiceAccount('hook-sa')).toBeUndefined();
  });

  it('maps AAP templates to select options', () => {
    expect(toAapSelectOptions([{ description: 'd', id: 7, name: 'tpl' }] as never)).toEqual([
      {
        content: 'tpl (ID: 7)',
        optionProps: { description: 'd' },
        value: 7,
      },
    ]);
  });
});
