import { t } from '@utils/i18n';

export enum MigrationTypeValue {
  Cold = 'cold',
  Warm = 'warm',
}

export const migrationTypeLabels: Record<MigrationTypeValue, ReturnType<typeof t>> = {
  [MigrationTypeValue.Cold]: t('Cold migration'),
  [MigrationTypeValue.Warm]: t('Warm migration'),
};

export enum MigrationTypeFieldId {
  MigrationType = 'migrationType',
}
