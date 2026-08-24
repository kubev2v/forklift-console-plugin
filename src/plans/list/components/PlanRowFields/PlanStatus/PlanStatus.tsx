import type { FC } from 'react';
import PlanResumeConversionModal, {
  type PlanResumeConversionModalProps,
} from 'src/plans/actions/components/ResumeConversionModal/PlanResumeConversionModal';
import PlanStartMigrationModal, {
  type PlanStartMigrationModalProps,
} from 'src/plans/actions/components/StartPlanModal/PlanStartMigrationModal';
import PlanStatusLabel from 'src/plans/details/components/PlanStatus/PlanStatusLabel';
import {
  getCantStartVMStatusCount,
  getMigrationVMsStatusCounts,
} from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import { canPlanResumeConversion } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import {
  getPlanStatus,
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, FlexItem, Spinner, Split } from '@patternfly/react-core';
import { PlayIcon as StartIcon, RedoIcon } from '@patternfly/react-icons';
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
  const launchOverlay = useOverlay();
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const planStatus = getPlanStatus(plan);
  const [activeMigration, loaded] = usePlanMigration(plan);

  const hasActiveMigration = !isEmpty(activeMigration);

  if (planStatus === PlanStatuses.Ready && loaded && !hasActiveMigration) {
    return (
      <Split hasGutter>
        <Button
          data-testid="plan-start-button-status"
          icon={<StartIcon />}
          isDisabled={hasActiveMigration}
          isInline
          onClick={() => {
            launchOverlay<PlanStartMigrationModalProps>(PlanStartMigrationModal, {
              plan,
              title: t('Start'),
            });
          }}
          variant={ButtonVariant.secondary}
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
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem className="plan-status-cell-label-section">
        {isPlanRunning &&
        PlanStatuses.Paused !== planStatus &&
        PlanStatuses.Pending !== planStatus ? (
          <Split hasGutter>
            <Spinner data-testid="plan-progress-spinner" size="md" />
            <span className="pf-v6-u-font-size-sm" data-testid="plan-progress-percentage">
              {Math.trunc(pipelinesProgressPercentage)}%
            </span>
          </Split>
        ) : (
          <PlanStatusLabel plan={plan} />
        )}
      </FlexItem>
      {canPlanResumeConversion(plan) && loaded && !hasActiveMigration && (
        <FlexItem>
          <Button
            data-testid="plan-resume-button-status"
            icon={<RedoIcon />}
            isInline
            onClick={() => {
              launchOverlay<PlanResumeConversionModalProps>(PlanResumeConversionModal, { plan });
            }}
            variant={ButtonVariant.link}
          >
            {t('Resume')}
          </Button>
        </FlexItem>
      )}
      <FlexItem>
        <VMStatusIconsRow plan={plan} statuses={vmStatuses} />
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
