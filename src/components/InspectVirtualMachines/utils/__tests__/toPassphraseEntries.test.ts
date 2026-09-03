import { toPassphraseEntries } from '../toPassphraseEntries';

describe('toPassphraseEntries', () => {
  it('maps passphrases to id/value entries', () => {
    expect(toPassphraseEntries(['a', 'b'], 'vm1')).toEqual([
      { id: 'vm1-0', value: 'a' },
      { id: 'vm1-1', value: 'b' },
    ]);
  });

  it('returns empty array for undefined or empty input', () => {
    expect(toPassphraseEntries(undefined, 'x')).toEqual([]);
    expect(toPassphraseEntries([], 'x')).toEqual([]);
  });
});
