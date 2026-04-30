import { describe, expect, it } from '@jest/globals';

import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
  HooksFormFieldId,
  MigrationHookFieldId,
} from '../constants';

describe('HookSource constants', () => {
  it('has distinct values for all three hook sources', () => {
    const sources = [HOOK_SOURCE_NONE, HOOK_SOURCE_LOCAL, HOOK_SOURCE_AAP];
    const uniqueSources = new Set(sources);
    expect(uniqueSources.size).toBe(sources.length);
  });

  it('HOOK_SOURCE_NONE is "none"', () => {
    expect(HOOK_SOURCE_NONE).toBe('none');
  });

  it('HOOK_SOURCE_LOCAL is "local"', () => {
    expect(HOOK_SOURCE_LOCAL).toBe('local');
  });

  it('HOOK_SOURCE_AAP is "aap"', () => {
    expect(HOOK_SOURCE_AAP).toBe('aap');
  });
});

describe('AapFormFieldId enum', () => {
  it('contains all required AAP form fields', () => {
    expect(AapFormFieldId.HookSource).toBe('hookSource');
    expect(AapFormFieldId.AapPreHookJobTemplateId).toBe('aapPreHookJobTemplateId');
    expect(AapFormFieldId.AapPostHookJobTemplateId).toBe('aapPostHookJobTemplateId');
  });

  it('does not overlap with HooksFormFieldId values', () => {
    const aapValues: string[] = Object.values(AapFormFieldId);
    const hookValues: string[] = Object.values(HooksFormFieldId);
    const overlap = aapValues.filter((val) => hookValues.includes(val));
    expect(overlap).toHaveLength(0);
  });

  it('does not overlap with MigrationHookFieldId values', () => {
    const aapValues: string[] = Object.values(AapFormFieldId);
    const migrationValues: string[] = Object.values(MigrationHookFieldId);
    const overlap = aapValues.filter((val) => migrationValues.includes(val));
    expect(overlap).toHaveLength(0);
  });
});
