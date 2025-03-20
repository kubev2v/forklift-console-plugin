import React, { FC } from 'react';
import { DateTime } from 'luxon';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { PlanCutoverMigrationModal } from 'src/modules/Plans/modals';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils';

import { Button, ButtonVariant, Flex, Label, Tooltip } from '@patternfly/react-core';

import { CellProps } from './CellProps';

export const MigrationTypeCell: FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const plan = data?.obj;
  const [lastMigration, migrationLoaded] = usePlanMigration(plan);

  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan) && !isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal resource={plan} />);
  };

  const cutoverSet = Boolean(lastMigration?.spec?.cutover);
  const cutoverTime = DateTime.fromISO(lastMigration?.spec?.cutover).toLocaleString(
    DateTime.DATETIME_FULL,
  );

  if (plan.spec.warm) {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
        <Label isCompact color="orange">
          {t('Warm')}
        </Label>

        {isWarmAndExecuting && migrationLoaded && (
          <>
            {cutoverSet ? (
              <Tooltip content={cutoverTime}>
                <Button isInline variant={ButtonVariant.link} onClick={onClickPlanCutoverMigration}>
                  {t('Edit cutover')}
                </Button>
              </Tooltip>
            ) : (
              <Button isInline variant={ButtonVariant.link} onClick={onClickPlanCutoverMigration}>
                {t('Schedule cutover')}
              </Button>
            )}
          </>
        )}
      </Flex>
    );
  }

  return (
    <Label isCompact color="blue">
      {t('Cold')}
    </Label>
  );
};
