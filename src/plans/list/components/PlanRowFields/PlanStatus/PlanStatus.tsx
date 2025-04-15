import { type FC, useState } from 'react';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals/PlanStartMigrationModal';
import {
  getPlanPhase,
  isPlanArchived,
  isPlanExecuting,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel } from '@kubev2v/types';
import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

import type { PlanFieldProps } from '../utils/types';

import PlanVirtualMachineStatuses from './components/PlanVirtualMachineStatuses';
import StatusPhaseLoader from './components/StatusPhaseLoader';
import usePipelineTaskProgress from './hooks/usePipelineTaskProgress';

import './PlanStatus.style.scss';

const PlanStatus: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const pipelinesProgressPercentage = usePipelineTaskProgress(plan);
  const phase = getPlanPhase({ plan });

  if (phase === PlanPhase.Ready) {
    return (
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
      >
        {t('Start')}
      </Button>
    );
  }

  const isWaitingForCutover = getPlanIsWarm(plan) && isPlanExecuting(plan) && !isPlanArchived(plan);
  const isPlanLoading =
    !isWaitingForCutover && (phase === PlanPhase.Running || phase === PlanPhase.Archiving);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <Flex className="plan-status-cell-label-section">
        <FlexItem>
          <StatusPhaseLoader phase={phase} loading={isPlanLoading} />
        </FlexItem>

        {pipelinesProgressPercentage !== 0 && isPlanLoading && (
          <FlexItem className="pf-v5-u-font-size-sm">
            {Math.trunc(pipelinesProgressPercentage)}%
          </FlexItem>
        )}
      </Flex>

      <FlexItem>
        <PlanVirtualMachineStatuses plan={plan} />
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
