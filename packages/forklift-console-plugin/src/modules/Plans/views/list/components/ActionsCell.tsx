import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import { getPlanPhase } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { CellProps } from './CellProps';

export const ActionsCell = ({ data }: CellProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const phase = getPlanPhase(data);
  const canStart = ['Ready', 'Warning', 'Canceled', 'Failed'].includes(phase);

  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}></FlexItem>
      {canStart && (
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            variant="secondary"
            onClick={() =>
              showModal(<PlanStartMigrationModal resource={data.obj} model={PlanModel} />)
            }
          >
            {t('Start')}
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
