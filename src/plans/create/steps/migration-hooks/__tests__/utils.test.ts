import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import type { AapJobTemplate } from '@utils/types/aap';

import { HooksFormFieldId, MigrationHookFieldId } from '../constants';
import {
  getEnableHookFieldLabel,
  getHooksSubFieldId,
  toAapSelectOptions,
  validateHookRunnerImage,
  validateHookServiceAccount,
} from '../utils';

describe('getHooksSubFieldId', () => {
  it('builds nested field ids', () => {
    expect(getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.EnableHook)).toBe(
      `${HooksFormFieldId.PreMigration}.${MigrationHookFieldId.EnableHook}`,
    );
  });
});

describe('getEnableHookFieldLabel', () => {
  it('returns pre- and post-migration labels', () => {
    expect(getEnableHookFieldLabel(HooksFormFieldId.PreMigration)).toMatch(/pre-migration/i);
    expect(getEnableHookFieldLabel(HooksFormFieldId.PostMigration)).toMatch(/post-migration/i);
  });
});

describe('validateHookRunnerImage', () => {
  it('returns error for empty string', () => {
    expect(validateHookRunnerImage('')).toBeDefined();
  });

  it('returns error for invalid container image', () => {
    expect(validateHookRunnerImage('bad image')).toMatch(/Invalid container image/i);
  });

  it('returns undefined for valid container image', () => {
    expect(validateHookRunnerImage('quay.io/konveyor/hook-runner')).toBeUndefined();
  });

  it('returns undefined for image with tag', () => {
    expect(validateHookRunnerImage('quay.io/konveyor/hook-runner:latest')).toBeUndefined();
  });
});

describe('validateHookServiceAccount', () => {
  it('returns undefined for empty string', () => {
    expect(validateHookServiceAccount('')).toBeUndefined();
  });

  it('returns undefined for valid K8s name', () => {
    expect(validateHookServiceAccount('my-sa')).toBeUndefined();
  });

  it('returns error for name with uppercase', () => {
    expect(validateHookServiceAccount('My-SA')).toBeDefined();
  });
});

describe('toAapSelectOptions', () => {
  it('maps AAP templates to select options', () => {
    const templates: AapJobTemplate[] = [{ description: 'd', id: 7, name: 'tpl' }];

    expect(toAapSelectOptions(templates)).toEqual([
      {
        content: 'tpl (ID: 7)',
        optionProps: { description: 'd' },
        value: 7,
      },
    ]);
  });
});
