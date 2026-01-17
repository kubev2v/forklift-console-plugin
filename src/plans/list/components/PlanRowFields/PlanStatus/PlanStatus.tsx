import { type FC, useEffect, useState } from 'react';
import PlanStartMigrationModal, {
  type PlanStartMigrationModalProps,
} from 'src/plans/actions/components/StartPlanModal/PlanStartMigrationModal';
import { isPlanMigrationInCooldown } from 'src/plans/actions/components/StartPlanModal/utils/utils';
import PlanStatusLabel from 'src/plans/details/components/PlanStatus/PlanStatusLabel';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import {
  getCantStartVMStatusCount,
  getMigrationVMsStatusCounts,
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, FlexItem, Spinner, Split } from '@patternfly/react-core';
import { PlayIcon as StartIcon } from '@patternfly/react-icons';
import {
  getPlanVirtualMachines,
  getPlanVirtualMachinesMigrationStatus,
} from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import type { PlanFieldProps } from '../utils/types';

import usePipelineTaskProgress from './hooks/usePipelineTaskProgress';

import './PlanStatus.style.scss';

const PlanStatus: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const planStatus = getPlanStatus(plan);
  const [activeMigration, loaded] = usePlanMigration(plan);
  const planUid = plan?.metadata?.uid;

  const [, forceUpdate] = useState(0);

  const isInCooldown = isPlanMigrationInCooldown(planUid);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [planUid]);

  if (planStatus === PlanStatuses.Ready && loaded && isEmpty(activeMigration)) {
    return (
      <Split hasGutter>
        <Button
          variant={ButtonVariant.secondary}
          icon={<StartIcon />}
          onClick={() => {
            if (isInCooldown) return;
            launcher<PlanStartMigrationModalProps>(PlanStartMigrationModal, {
              plan,
              title: t('Start'),
            });
          }}
          isDisabled={isInCooldown}
          isInline
          data-testid="plan-start-button-status"
        >
          {t('Start')}
        </Button>
      </Split>
    );
  }

  const isPlanRunning = isPlanExecuting(plan) && !isPlanArchived(plan);

  const vmStatuses =
    PlanStatuses.CannotStart === planStatus
      ? getCantStartVMStatusCount(getPlanVirtualMachines(plan))
      : getMigrationVMsStatusCounts(
          getPlanVirtualMachinesMigrationStatus(plan),
          getPlanVirtualMachinesMigrationStatus(plan).length,
          planStatus,
        );

  return (
    <>
      <Flex
        direction={{ default: 'row' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem className="plan-status-cell-label-section">
          {isPlanRunning && PlanStatuses.Paused !== planStatus ? (
            <Split hasGutter>
              <Spinner size="md" data-testid="plan-progress-spinner" />
              <span className="pf-v6-u-font-size-sm" data-testid="plan-progress-percentage">
                {Math.trunc(pipelinesProgressPercentage)}%
              </span>
            </Split>
          ) : (
            <PlanStatusLabel plan={plan} />
          )}
        </FlexItem>
        <FlexItem>
          <VMStatusIconsRow plan={plan} statuses={vmStatuses} />
        </FlexItem>
      </Flex>
    </>
  );
};

export default PlanStatus;
