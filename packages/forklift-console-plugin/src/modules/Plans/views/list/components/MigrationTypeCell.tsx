import React, { FC } from 'react';
import { PlanCutoverMigrationModal } from 'src/modules/Plans/modals';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils';

import { Button, Flex, Label } from '@patternfly/react-core';

import { CellProps } from './CellProps';

export const MigrationTypeCell: FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const plan = data?.obj;

  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal resource={plan} />);
  };

  if (plan.spec.warm) {
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
        <Label isCompact color="orange">
          {t('Warm')}
        </Label>

        {isWarmAndExecuting && !isArchived && (
          <Button isInline variant="link" onClick={onClickPlanCutoverMigration}>
            {t('Cutover')}
          </Button>
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
