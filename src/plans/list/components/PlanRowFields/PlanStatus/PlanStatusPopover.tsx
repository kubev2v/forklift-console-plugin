import type { FC, ReactElement } from 'react';
import { useNavigate } from 'react-router';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import type { PlanModalProps } from 'src/plans/actions/components/types';
import MigrationCounterText from 'src/plans/details/components/PlanStatus/MigrationCounterText';
import MigrationPerformanceDetails from 'src/plans/details/components/PlanStatus/MigrationPerformanceDetails';
import MigrationProcessedText from 'src/plans/details/components/PlanStatus/MigrationProcessedText';
import MigrationStageTable from 'src/plans/details/components/PlanStatus/MigrationStageTable';
import {
  isPlanArchived,
  isPlanExecuting,
} from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { getPopoverMessageByStatus } from 'src/plans/details/components/PlanStatus/utils/statusPopoverMessages';
import { MigrationVirtualMachineStatus } from 'src/plans/details/components/PlanStatus/utils/types';

import { PlanModelRef, type V1beta1MigrationStatusVms, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Popover, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';
import { useForkliftTranslation } from '@utils/i18n';
import { getPlanMigrationPerformance } from '@utils/migrations/migrationPerformance';

import { getCutoverWaitingVmsCounter } from './utils/cutoverWaitingVms';

type PlanStatusPopoverProps = {
  children: ReactElement;
  migrationVMs?: V1beta1MigrationStatusVms[];
  plan: V1beta1Plan;
};

const PlanStatusPopover: FC<PlanStatusPopoverProps> = ({ children, migrationVMs, plan }) => {
  const launchOverlay = useOverlay();
  const navigate = useNavigate();
  const { t } = useForkliftTranslation();

  const performance = getPlanMigrationPerformance(plan);
  const isRunning = isPlanExecuting(plan) && !isPlanArchived(plan);

  const pausedCount = migrationVMs ? getCutoverWaitingVmsCounter(migrationVMs) : 0;
  const { actionLabel, body } = pausedCount
    ? getPopoverMessageByStatus(MigrationVirtualMachineStatus.Paused, pausedCount)
    : { actionLabel: t('View migration details'), body: undefined };

  const openScheduleCutoverModal = (): void => {
    launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
  };

  const navigateToVMsTab = (): void => {
    const url = `${getResourceUrl({ name: getName(plan), namespace: getNamespace(plan), reference: PlanModelRef })}/vms`;
    navigate(url)?.catch(() => undefined);
  };
  if (!isRunning && !performance) {
    return <>{children}</>;
  }

  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          {isRunning && (
            <Stack hasGutter>
              {body && <StackItem>{body}</StackItem>}
              <StackItem>
                <Button
                  isInline
                  onClick={() => {
                    if (pausedCount) {
                      openScheduleCutoverModal();
                      return;
                    }
                    navigateToVMsTab();
                  }}
                  variant={ButtonVariant.link}
                >
                  {actionLabel}
                </Button>
              </StackItem>
              {migrationVMs && plan.spec?.vms.length && (
                <MigrationCounterText planSpecVMsTotal={plan.spec?.vms.length} vms={migrationVMs} />
              )}
              <StackItem>
                <MigrationStageTable vms={migrationVMs}></MigrationStageTable>
              </StackItem>
              <StackItem>
                {migrationVMs && plan.spec?.vms.length && (
                  <StackItem>
                    <MigrationProcessedText
                      planSpecVMsTotal={plan.spec?.vms.length}
                      vms={migrationVMs}
                    />
                  </StackItem>
                )}
              </StackItem>
            </Stack>
          )}
          {performance && (
            <StackItem>
              <MigrationPerformanceDetails performance={performance} />
            </StackItem>
          )}
        </Stack>
      }
      hasAutoWidth
      headerContent={isRunning ? t('Migration progress') : t('Last migration')}
      position="right"
      showClose={false}
      triggerAction="hover"
    >
      <span
        aria-label={t('Show migration performance details')}
        className="plan-status-cell-label-section__trigger"
        data-testid="plan-status-popover-trigger"
        tabIndex={0}
      >
        {children}
      </span>
    </Popover>
  );
};

export default PlanStatusPopover;
