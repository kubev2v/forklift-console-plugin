import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { PlanCutoverMigrationModal } from 'src/modules/Plans/modals';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, Flex, FlexItem } from '@patternfly/react-core';
import CutoverIcon from '@patternfly/react-icons/dist/esm/icons/migration-icon';

import { CellProps } from './CellProps';

export const ActionsCell = ({ data }: CellProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const plan = data.obj;
  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal resource={plan} />);
  };

  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}></FlexItem>

      {isWarmAndExecuting && !isArchived && (
        <FlexItem align={{ default: 'alignRight' }}>
          <Button variant="secondary" icon={<CutoverIcon />} onClick={onClickPlanCutoverMigration}>
            {t('Cutover')}
          </Button>
        </FlexItem>
      )}

      <FlexItem align={{ default: 'alignRight' }}>
        <PlanActionsDropdown isKebab data={data} fieldId={'actions'} fields={[]} />
      </FlexItem>
    </Flex>
  );
};
ActionsCell.displayName = 'ActionsCell';
