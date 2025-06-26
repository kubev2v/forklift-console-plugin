import type { FC } from 'react';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants.ts';

import { Button, ButtonVariant, Label, Popover } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import './PlanMigrationTypeLabel.scss';

type PlanMigrationTypeLabelProps = {
  migrationType: MigrationTypeValue;
};

const PlanMigrationTypeLabel: FC<PlanMigrationTypeLabelProps> = ({ migrationType }) => {
  const { t } = useForkliftTranslation();

  const typeLabel = (): string => {
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

  const bodyContent = (): string => {
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

  return (
    <Popover
      headerContent={t('{{type}} migration', { type: typeLabel() })}
      bodyContent={bodyContent()}
    >
      <Button className="forklift-plan-migration-type-label" variant={ButtonVariant.plain} isInline>
        <Label isCompact color={migrationType === MigrationTypeValue.Cold ? 'blue' : 'orange'}>
          {t(typeLabel())}
        </Label>
      </Button>
    </Popover>
  );
};

export default PlanMigrationTypeLabel;
