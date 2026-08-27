import { describe, expect, it } from '@jest/globals';

import { NameTemplateOptions } from '../types';
import { getNameTemplateOptions, getNameTemplateStateLabel, getSelectedOption } from '../utils';

describe('EditNameTemplate utils - options', () => {
  it('includes inherit option when allowed', () => {
    const options = getNameTemplateOptions(true);
    expect(options.map((option) => option.value)).toEqual([
      NameTemplateOptions.InheritPlanWideSetting,
      NameTemplateOptions.CustomNameTemplate,
    ]);
    expect(options[0].getInheritToDescription?.('')).toMatch(/default/i);
    expect(options[0].getInheritToDescription?.('tpl')).toMatch(/tpl/);
  });

  it('includes default option when inherit is not allowed', () => {
    expect(getNameTemplateOptions(false).map((option) => option.value)).toEqual([
      NameTemplateOptions.DefaultNameTemplate,
      NameTemplateOptions.CustomNameTemplate,
    ]);
  });

  it('resolves selected option and labels', () => {
    expect(getSelectedOption('custom', true)).toBe(NameTemplateOptions.CustomNameTemplate);
    expect(getSelectedOption(undefined, true)).toBe(NameTemplateOptions.InheritPlanWideSetting);
    expect(getSelectedOption(undefined, false)).toBe(NameTemplateOptions.DefaultNameTemplate);

    expect(
      getNameTemplateStateLabel(NameTemplateOptions.InheritPlanWideSetting, true),
    ).toMatch(/Inherit plan wide setting/i);
    expect(
      getNameTemplateStateLabel(NameTemplateOptions.DefaultNameTemplate, false),
    ).toMatch(/Default name template/i);
    expect(
      getNameTemplateStateLabel(NameTemplateOptions.CustomNameTemplate, true),
    ).toMatch(/Custom name template/i);
    expect(
      getNameTemplateStateLabel(NameTemplateOptions.CustomNameTemplate, false),
    ).toMatch(/Custom name template/i);
  });
});
