import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { PlanCutoverMigrationModal, PlanStartMigrationModal } from 'src/modules/Plans/modals';
import { canPlanReStart, canPlanStart, isPlanExecuting } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import CutoverIcon from '@patternfly/react-icons/dist/esm/icons/migration-icon';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import ReStartIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import { CellProps } from './CellProps';

export const ActionsCell = ({ data }: CellProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const plan = data.obj;

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);

  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan);

  const buttonStartLabel = canReStart ? t('Restart') : t('Start');
  const buttonStartIcon = canReStart ? (
    <ReStartIcon className="forklift-providers-list-buttons__icon" />
  ) : (
    <StartIcon className="forklift-providers-list-buttons__icon" />
  );
  const buttonCutoverIcon = <CutoverIcon className="forklift-providers-list-buttons__icon" />;

  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}></FlexItem>

      {canStart && (
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            className="forklift-providers-list-buttons"
            variant="secondary"
            icon={buttonStartIcon}
            onClick={() =>
              showModal(
                <PlanStartMigrationModal
                  resource={data.obj}
                  model={PlanModel}
                  title={buttonStartLabel}
                />,
              )
            }
          >
            {buttonStartLabel}
          </Button>
        </FlexItem>
      )}

      {isWarmAndExecuting && (
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            className="forklift-providers-list-buttons"
            variant="secondary"
            icon={buttonCutoverIcon}
            onClick={() => showModal(<PlanCutoverMigrationModal resource={data.obj} />)}
          >
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
