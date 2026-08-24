import type { PassphraseEntry } from './types';

export const toPassphraseEntries = (
  passphrases: string[] | undefined,
  idPrefix: string,
): PassphraseEntry[] =>
  (passphrases ?? []).map((value, index) => ({ id: `${idPrefix}-${index}`, value }));
