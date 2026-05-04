import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import InspectVirtualMachinesModal, {
  type InspectVirtualMachinesModalProps,
} from 'src/components/InspectVirtualMachines/InspectVirtualMachinesModal';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import PlanActionsDropdown from 'src/plans/actions/PlanActionsDropdown';
import PlanEditCutoverButton from 'src/plans/actions/PlanEditCutoverButton';
import { useCanInspectPlan } from 'src/plans/details/hooks/useCanInspectPlan';

import { PlanModel } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { usePlan } from '../../hooks/usePlan';
import PlanStatusLabel from '../PlanStatus/PlanStatusLabel';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeaderProps = {
  name: string;
  namespace: string;
  setShowPlanConcernsPanel?: (isOpen: boolean) => void;
};

const PlanPageHeader: FC<PlanPageHeaderProps> = ({ name, namespace, setShowPlanConcernsPanel }) => {
  const { plan } = usePlan(name, namespace);
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const { canInspect, disabledReason, isVsphere, provider } = useCanInspectPlan(plan);

  const onClickInspectVms = (): void => {
    launcher<InspectVirtualMachinesModalProps>(InspectVirtualMachinesModal, {
      plan,
      provider,
    });
  };

  const inspectButton = isVsphere ? (
    <FlexItem>
      <Tooltip content={disabledReason} trigger={disabledReason ? undefined : 'manual'}>
        <Button
          variant={ButtonVariant.secondary}
          isDisabled={!canInspect}
          onClick={onClickInspectVms}
          data-testid="plan-inspect-vms-button"
        >
          {t('Inspect VMs')}
        </Button>
      </Tooltip>
    </FlexItem>
  ) : null;

  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={namespace}
      testId="resource-details-title"
      status={<PlanStatusLabel plan={plan} />}
      actions={
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <LearningExperienceButton />
          </FlexItem>
          {inspectButton}
          <FlexItem>
            <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />
          </FlexItem>
          <FlexItem>
            <PlanActionsDropdown plan={plan} />
          </FlexItem>
        </Flex>
      }
    >
      <PlanAlerts plan={plan} setIsDrawerOpen={setShowPlanConcernsPanel} />
    </PageHeadings>
  );
};

export default PlanPageHeader;
