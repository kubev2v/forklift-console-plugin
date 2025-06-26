import { t } from '@utils/i18n';

export enum MigrationTypeValue {
  Cold = 'cold',
  Warm = 'warm',
  Live = 'live',
}

export const migrationTypeLabels: Record<MigrationTypeValue, ReturnType<typeof t>> = {
  [MigrationTypeValue.Cold]: t('Cold migration'),
  [MigrationTypeValue.Live]: t('Live migration'),
  [MigrationTypeValue.Warm]: t('Warm migration'),
};

export enum MigrationTypeFieldId {
  MigrationType = 'migrationType',
}
