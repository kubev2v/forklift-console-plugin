import { t } from '@utils/i18n';

export enum OtherSettingsFormFieldId {
  DiskDecryptionPassPhrases = 'diskDecryptionPassPhrases',
  DiskDecryptionType = 'diskDecryptionType',
  ExistingLUKSSecret = 'existingLUKSSecret',
  InstanceTypes = 'instanceTypes',
  NBDEClevis = 'nbdeClevis',
  TransferNetwork = 'transferNetwork',
  PreserveStaticIps = 'preserveStaticIps',
  RootDevice = 'rootDevice',
  MigrateSharedDisks = 'migrateSharedDisks',
  TargetPowerState = 'targetPowerState',
}

export enum DiskDecryptionType {
  Existing = 'existing',
  New = 'new',
}

export const DiskDecryptionTypeLabels: Record<DiskDecryptionType, ReturnType<typeof t>> = {
  [DiskDecryptionType.Existing]: t('Use an existing secret'),
  [DiskDecryptionType.New]: t('Enter passphrases'),
};

export const otherFormFieldLabels: Record<OtherSettingsFormFieldId, ReturnType<typeof t>> = {
  [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: t('Disk decryption passphrases'),
  [OtherSettingsFormFieldId.DiskDecryptionType]: t('Disk decryption type'),
  [OtherSettingsFormFieldId.ExistingLUKSSecret]: t('Secret'),
  [OtherSettingsFormFieldId.InstanceTypes]: t('Instance types'),
  [OtherSettingsFormFieldId.MigrateSharedDisks]: t('Migrate shared disks'),
  [OtherSettingsFormFieldId.NBDEClevis]: t('Use network-bound disk encryption (NBDE/Clevis)'),
  [OtherSettingsFormFieldId.PreserveStaticIps]: t('Preserve static IPs'),
  [OtherSettingsFormFieldId.RootDevice]: t('Root device'),
  [OtherSettingsFormFieldId.TargetPowerState]: t('VM target power state'),
  [OtherSettingsFormFieldId.TransferNetwork]: t('Transfer network'),
};

export type DiskPassPhrase = { value: string };

export const defaultDiskPassPhrase: DiskPassPhrase = { value: '' };
export const defaultTransferNetwork = t('Target provider default');

export const maxDiskPassPhrases = 20;
