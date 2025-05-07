import { OtherSettingsFormFieldId } from './constants';

type DiskPassPhraseId = `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.${number}.value`;

export const getDiskPassPhraseFieldId = (index: number): DiskPassPhraseId =>
  `${OtherSettingsFormFieldId.DiskDecryptionPassPhrases}.${index}.value`;
