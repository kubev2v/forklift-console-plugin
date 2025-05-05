import { t } from '@utils/i18n';

export enum OtherSettingsFormFieldId {
  DiskDecryptionPassPhrases = 'diskDecryptionPassPhrases',
  TransferNetwork = 'transferNetwork',
  PreserveStaticIps = 'preserveStaticIps',
  RootDevice = 'rootDevice',
  SharedDisks = 'sharedDisks',
}

export const otherFormFieldLabels: Record<OtherSettingsFormFieldId, ReturnType<typeof t>> = {
  [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: t('Disk decryption passphrases'),
  [OtherSettingsFormFieldId.PreserveStaticIps]: t('Preserve static IPs'),
  [OtherSettingsFormFieldId.RootDevice]: t('Root device'),
  [OtherSettingsFormFieldId.SharedDisks]: t('Shared disks'),
  [OtherSettingsFormFieldId.TransferNetwork]: t('Transfer network'),
};

export type DiskPassPhrase = { value: string };

export const defaultDiskPassPhrase: DiskPassPhrase = { value: '' };
export const defaultTransferNetwork = t('Target provider default');

export const maxDiskPassPhrases = 20;
