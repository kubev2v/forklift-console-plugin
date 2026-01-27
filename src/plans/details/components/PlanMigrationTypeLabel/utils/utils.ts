import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import type { LabelProps } from '@patternfly/react-core';
import { t } from '@utils/i18n';

export const typeLabel = (migrationType: MigrationTypeValue): string => {
  switch (migrationType) {
    case MigrationTypeValue.Live:
      return 'Live';
    case MigrationTypeValue.Warm:
      return 'Warm';
    case MigrationTypeValue.Conversion:
      return 'Conversion';
    case MigrationTypeValue.Cold:
    default:
      return 'Cold';
  }
};

export const getLabelColor = (migrationType: MigrationTypeValue): LabelProps['color'] => {
  switch (migrationType) {
    case MigrationTypeValue.Cold:
      return 'blue';
    case MigrationTypeValue.Warm:
      return 'orange';
    case MigrationTypeValue.Conversion:
      return 'purple';
    case MigrationTypeValue.Live:
    default:
      return 'teal';
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
    case MigrationTypeValue.Conversion:
      return t(
        'With a conversion migration, we will convert a virtual machine to a different architecture.',
      );
    case MigrationTypeValue.Cold:
    default:
      return t('With a cold migration, we will move the shut down VM between hosts.');
  }
};
