import { type FC, useState } from 'react';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals/PlanStartMigrationModal';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanStatusLabel from 'src/plans/details/components/PlanStatus/PlanStatusLabel';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import {
  getMigrationVMsStatusCounts,
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';
import { Button, ButtonVariant, Flex, FlexItem, Split } from '@patternfly/react-core';
import { PlayIcon as StartIcon } from '@patternfly/react-icons';
import {
  getPlanIsWarm,
  getPlanVirtualMachines,
  getPlanVirtualMachinesMigrationStatus,
} from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

import usePipelineTaskProgress from './hooks/usePipelineTaskProgress';

import './PlanStatus.style.scss';

const PlanStatus: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const planStatus = getPlanStatus(plan);

  if (planStatus === PlanStatuses.Ready) {
    return (
      <Split hasGutter>
        <Button
          variant={ButtonVariant.secondary}
          icon={<StartIcon />}
          isDisabled={!isButtonEnabled}
          onClick={() => {
            showModal(
              <PlanStartMigrationModal
                resource={plan}
                model={PlanModel}
                title={t('Start')}
                setButtonEnabledOnChange={setIsButtonEnabled}
              />,
            );
          }}
          isInline
        >
          {t('Start')}
        </Button>
      </Split>
    );
  }

  const isWaitingForCutover = getPlanIsWarm(plan) && isPlanExecuting(plan) && !isPlanArchived(plan);
  const isPlanRunning = !isWaitingForCutover && planStatus === PlanStatuses.Executing;

  const vmStatuses = getMigrationVMsStatusCounts(
    getPlanVirtualMachinesMigrationStatus(plan),
    planStatus,
    getPlanVirtualMachines(plan).length,
  );

  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem className="plan-status-cell-label-section">
          <PlanStatusLabel plan={plan} />
        </FlexItem>

        {pipelinesProgressPercentage !== 0 && isPlanRunning && (
          <FlexItem className="pf-v5-u-font-size-sm">
            {Math.trunc(pipelinesProgressPercentage)}%
          </FlexItem>
        )}

        <FlexItem>
          <VMStatusIconsRow statuses={vmStatuses} />
        </FlexItem>
      </Flex>
    </>
  );
};

export default PlanStatus;
