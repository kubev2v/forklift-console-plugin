import { t } from '@utils/i18n';

export enum OtherSettingsFormFieldId {
  DiskDecryptionPassPhrases = 'diskDecryptionPassPhrases',
  TransferNetwork = 'transferNetwork',
  PreserveStaticIps = 'preserveStaticIps',
  RootDevice = 'rootDevice',
  MigrateSharedDisks = 'migrateSharedDisks',
  TargetPowerState = 'targetPowerState',
}

export const otherFormFieldLabels: Record<OtherSettingsFormFieldId, ReturnType<typeof t>> = {
  [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: t('Disk decryption passphrases'),
  [OtherSettingsFormFieldId.MigrateSharedDisks]: t('Migrate shared disks'),
  [OtherSettingsFormFieldId.PreserveStaticIps]: t('Preserve static IPs'),
  [OtherSettingsFormFieldId.RootDevice]: t('Root device'),
  [OtherSettingsFormFieldId.TargetPowerState]: t('VM target power state'),
  [OtherSettingsFormFieldId.TransferNetwork]: t('Transfer network'),
};

export type DiskPassPhrase = { value: string };

export const defaultDiskPassPhrase: DiskPassPhrase = { value: '' };
export const defaultTransferNetwork = t('Target provider default');

export const maxDiskPassPhrases = 20;

export type TargetPowerStateValue = 'auto' | 'on' | 'off';
export type TargetPowerState = {
  description?: string;
  label: string;
  value: TargetPowerStateValue;
};

export const defaultTargetPowerStateOption: TargetPowerState = {
  description: t('Retain source VM power state'),
  label: t('Auto'),
  value: 'auto',
};
