import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { t } from '@utils/i18n';

export const typeLabel = (migrationType: MigrationTypeValue): string => {
  switch (migrationType) {
    case MigrationTypeValue.Live:
      return 'Live';
    case MigrationTypeValue.Warm:
      return 'Warm';
    case MigrationTypeValue.Cold:
    default:
      return 'Cold';
  }
};

export const bodyContent = (migrationType: MigrationTypeValue): string => {
  switch (migrationType) {
    case MigrationTypeValue.Live:
      return t('With a live migration, we will move an active virtual machine without downtime.');
    case MigrationTypeValue.Warm:
      return t(
        'With a warm migration, we will move an active virtual machine between hosts with minimal downtime. This is not a live migration.',
      );
    case MigrationTypeValue.Cold:
    default:
      return t('With a cold migration, we will move the shut down VM between hosts.');
  }
};
