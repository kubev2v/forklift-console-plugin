import type { FC } from 'react';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { Label, Popover } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { bodyContent, typeLabel } from './utils/utils';

type PlanMigrationTypeLabelProps = {
  migrationType: MigrationTypeValue;
};

const PlanMigrationTypeLabel: FC<PlanMigrationTypeLabelProps> = ({ migrationType }) => {
  const { t } = useForkliftTranslation();

  return (
    <Popover
      headerContent={t('{{type}} migration', { type: typeLabel(migrationType) })}
      bodyContent={bodyContent(migrationType)}
      triggerAction="hover"
    >
      <Label isCompact color={migrationType === MigrationTypeValue.Cold ? 'blue' : 'orange'}>
        {t('{{label}}', { label: typeLabel(migrationType) })}
      </Label>
    </Popover>
  );
};

export default PlanMigrationTypeLabel;
