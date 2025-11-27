import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { useForkliftTranslation } from 'src/utils/i18n';

import StandardPage from '@components/page/StandardPage';
import {
  Bullseye,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { getPlanURL } from '@utils/crds/plans/utils';

import { usePlan } from '../../hooks/usePlan';
import { useSpecVirtualMachinesListData } from '../../tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/hooks/useSpecVirtualMachinesListData';
import {
  MIGRATION_PLAN_CONCERNS_DESC_LABEL,
  MIGRATION_PLAN_CONCERNS_TITLE_LABEL,
} from '../../utils/constants';
import { getCriticalConcernsVmsMap } from '../../utils/utils';
import usePlanAlerts from '../PlanPageHeader/hooks/usePlanAlerts';
import { PlanStatuses } from '../PlanStatus/utils/types';

import { convertToPlanConcernsConditionsPanelData } from './utils/convertToPlanConcernsConditionsPanelData';
import { planConcernsPanelFields } from './utils/planConcernsPanelFields';
import type { PlanConcernsPanelData } from './utils/types';
import PlanConcernsRow from './PlanConcernsRow';

type PlanConcernsPanelProps = {
  name: string;
  namespace: string;
  showPlanConcernsPanel: boolean;
  setShowPlanConcernsPanel: (isOpen: boolean) => void;
};

const PlanConcernsPanel: FC<PlanConcernsPanelProps> = ({
  name,
  namespace,
  setShowPlanConcernsPanel,
  showPlanConcernsPanel,
}) => {
  const { t } = useForkliftTranslation();

  const userSettings = useMemo(
    () => loadUserSettings({ pageId: 'MigrationPlanConcernsPanel' }),
    [],
  );
  const { loaded, loadError, plan } = usePlan(name, namespace);
  const { criticalConditions, showCriticalConditions, status } = usePlanAlerts(plan);
  const [specVirtualMachinesListData] = useSpecVirtualMachinesListData(plan);
  const criticalConcerns = useMemo(
    () => getCriticalConcernsVmsMap(specVirtualMachinesListData),
    [specVirtualMachinesListData],
  );
  const planUrl = useMemo(() => getPlanURL(plan), [plan]);
  const planConcernsConditionsPanelData: PlanConcernsPanelData[] = useMemo(
    () => convertToPlanConcernsConditionsPanelData(criticalConditions, criticalConcerns, planUrl),
    [criticalConditions, criticalConcerns, planUrl],
  );
  const alertsNotRelevant = useMemo(
    () => status === PlanStatuses.Completed || status === PlanStatuses.Archived,
    [status],
  );

  if (showPlanConcernsPanel && (alertsNotRelevant || !showCriticalConditions)) {
    return <Bullseye className="text-muted">{t('No data available.')}</Bullseye>;
  }

  return (
    <DrawerPanelContent isResizable className="pfext-quick-start__base plan-concerns-panel">
      <DrawerHead>
        <div className="pfext-quick-start-panel-content__title" tabIndex={-1}>
          <Stack hasGutter>
            <StackItem>
              <Title
                headingLevel="h2"
                size="xl"
                className="pfext-quick-start-panel-content__name plan-concerns-panel__content__title "
              >
                {MIGRATION_PLAN_CONCERNS_TITLE_LABEL}
              </Title>
            </StackItem>
            <StackItem>
              <section>{MIGRATION_PLAN_CONCERNS_DESC_LABEL}</section>
            </StackItem>
          </Stack>
        </div>

        <DrawerActions>
          <DrawerCloseButton
            className="pfext-quick-start-panel-content__close-button"
            onClick={() => {
              setShowPlanConcernsPanel(false);
            }}
          />
        </DrawerActions>
      </DrawerHead>
      <StandardPage
        dataSource={[planConcernsConditionsPanelData ?? [], loaded, loadError]}
        fieldsMetadata={planConcernsPanelFields}
        namespace={namespace}
        userSettings={userSettings}
        cell={PlanConcernsRow}
        showManageColumns={false}
      />
    </DrawerPanelContent>
  );
};

export default PlanConcernsPanel;
