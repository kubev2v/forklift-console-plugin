import type { TypeaheadSelectOption } from '../../../utils/types';
import { createItemElementId, getNextEnabledIndex, getPrevEnabledIndex } from '../utils';

const opts = (flags: boolean[]): TypeaheadSelectOption[] =>
  flags.map((disabled, index) => ({
    content: `opt-${index}`,
    optionProps: { isDisabled: disabled },
    value: index,
  }));

describe('MultiTypeaheadSelect utils - navigation', () => {
  it('creates stable element ids from values', () => {
    expect(createItemElementId('hello world')).toBe('select-multi-typeahead-hello-world');
    expect(createItemElementId(12)).toBe('select-multi-typeahead-12');
  });

  it('advances from a disabled start index to the next enabled option', () => {
    const options = opts([true, false, true, false]);

    expect(getNextEnabledIndex(options, 0)).toBe(1);
    expect(getPrevEnabledIndex(options, 0)).toBe(3);
  });

  it('skips disabled options when startIndex is mid-list (ArrowUp/Down path)', () => {
    const options = opts([false, true, false]);

    expect(getNextEnabledIndex(options, 1)).toBe(2);
    expect(getPrevEnabledIndex(options, 1)).toBe(0);
  });

  it('wraps past the end to the first enabled option', () => {
    const options = opts([false, true, false]);

    expect(getNextEnabledIndex(options, 3)).toBe(0);
    expect(getPrevEnabledIndex(options, -1)).toBe(2);
  });

  it('returns startIndex when every option is disabled', () => {
    const options = opts([true, true, true]);

    expect(getNextEnabledIndex(options, 1)).toBe(1);
    expect(getPrevEnabledIndex(options, 1)).toBe(1);
  });
});
