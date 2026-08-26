import { describe, expect, it } from '@jest/globals';

import { OtherSettingsFormFieldId } from '../constants';
import { getDiskPassPhraseFieldId } from '../utils';

describe('getDiskPassPhraseFieldId - ids', () => {
  it('builds nested field ids for passphrase rows', () => {
    expect(getDiskPassPhraseFieldId(0)).toBe(
      `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.0.value`,
    );
    expect(getDiskPassPhraseFieldId(3)).toBe(
      `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.3.value`,
    );
  });
});
