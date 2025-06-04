import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanStartMigrationModal from 'src/plans/actions/components/StartPlanModal/PlanStartMigrationModal';
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

import { Button, ButtonVariant, Flex, FlexItem, Spinner, Split } from '@patternfly/react-core';
import { PlayIcon as StartIcon } from '@patternfly/react-icons';
import {
  getPlanVirtualMachines,
  getPlanVirtualMachinesMigrationStatus,
} from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

import usePipelineTaskProgress from './hooks/usePipelineTaskProgress';

import './PlanStatus.style.scss';

const PlanStatus: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const planStatus = getPlanStatus(plan);

  if (planStatus === PlanStatuses.Ready) {
    return (
      <Split hasGutter>
        <Button
          variant={ButtonVariant.secondary}
          icon={<StartIcon />}
          onClick={() => {
            showModal(<PlanStartMigrationModal plan={plan} title={t('Start')} />);
          }}
          isInline
        >
          {t('Start')}
        </Button>
      </Split>
    );
  }

  const isPlanRunning = isPlanExecuting(plan) && !isPlanArchived(plan);

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
        {isPlanRunning ? (
          <Spinner size="md" />
        ) : (
          <FlexItem className="plan-status-cell-label-section">
            <PlanStatusLabel plan={plan} />
          </FlexItem>
        )}

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
