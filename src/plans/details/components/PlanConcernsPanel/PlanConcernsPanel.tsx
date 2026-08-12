import { type FC, useEffect, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';

import StandardPage from '@components/page/StandardPage';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { getUID } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { getPlanURL } from '@utils/crds/plans/utils';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

import { usePlan } from '../../hooks/usePlan';
import { useSpecVirtualMachinesListData } from '../../tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/hooks/useSpecVirtualMachinesListData';
import {
  MIGRATION_PLAN_CONCERNS_DESC_LABEL,
  MIGRATION_PLAN_CONCERNS_TITLE_LABEL,
} from '../../utils/constants';
import {
  getCriticalConcernsVmsMap,
  getCriticalInspectionConcernsVmsMap,
  mergeConcernsMaps,
} from '../../utils/utils';
import usePlanAlerts from '../PlanPageHeader/hooks/usePlanAlerts';
import { PlanStatuses } from '../PlanStatus/utils/types';

import { convertToPlanConcernsConditionsPanelData } from './utils/convertToPlanConcernsConditionsPanelData';
import { planConcernsPanelFields } from './utils/planConcernsPanelFields';
import type { PlanConcernsPanelData } from './utils/types';
import PlanConcernsRow from './PlanConcernsRow';

type PlanConcernsPanelProps = {
  name: string;
  namespace: string;
  setShowPlanConcernsPanel: (isOpen: boolean) => void;
  showPlanConcernsPanel: boolean;
};

const PlanConcernsPanel: FC<PlanConcernsPanelProps> = ({
  name,
  namespace,
  setShowPlanConcernsPanel,
  showPlanConcernsPanel,
}) => {
  const userSettings = useMemo(
    () => loadUserSettings({ pageId: 'MigrationPlanConcernsPanel' }),
    [],
  );
  const { loaded, loadError, plan } = usePlan(name, namespace);
  const { criticalConditions, showCriticalConditions, status } = usePlanAlerts(plan);
  const [specVirtualMachinesListData] = useSpecVirtualMachinesListData(plan);

  const [conversions]: [V1beta1Conversion[], boolean, unknown] = useWatchConversions({
    namespace,
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        ...(getUID(plan) ? { [CONVERSION_LABELS.PLAN]: getUID(plan) ?? '' } : {}),
      },
    },
  });

  const { inspectionLabels, mergedConcerns } = useMemo(() => {
    const inventoryConcerns = getCriticalConcernsVmsMap(specVirtualMachinesListData);
    const inspectionConcerns = getCriticalInspectionConcernsVmsMap(conversions);
    return {
      inspectionLabels: new Set(inspectionConcerns.keys()),
      mergedConcerns: mergeConcernsMaps(inventoryConcerns, inspectionConcerns),
    };
  }, [specVirtualMachinesListData, conversions]);

  const planUrl = useMemo(() => getPlanURL(plan), [plan]);
  const planConcernsConditionsPanelData: PlanConcernsPanelData[] = useMemo(
    () =>
      convertToPlanConcernsConditionsPanelData(
        criticalConditions,
        mergedConcerns,
        planUrl,
        inspectionLabels,
      ),
    [criticalConditions, mergedConcerns, planUrl, inspectionLabels],
  );
  const alertsNotRelevant = useMemo(
    () => status === PlanStatuses.Completed || status === PlanStatuses.Archived,
    [status],
  );

  useEffect(() => {
    if (
      loaded &&
      !loadError &&
      showPlanConcernsPanel &&
      (alertsNotRelevant || !showCriticalConditions)
    ) {
      setShowPlanConcernsPanel(false);
    }
  }, [
    alertsNotRelevant,
    loaded,
    loadError,
    setShowPlanConcernsPanel,
    showCriticalConditions,
    showPlanConcernsPanel,
  ]);

  return (
    <DrawerPanelContent className="pfext-quick-start__base plan-concerns-panel" isResizable>
      <DrawerHead>
        <div className="pfext-quick-start-panel-content__title" tabIndex={-1}>
          <Stack hasGutter>
            <StackItem>
              <Title
                className="pfext-quick-start-panel-content__name plan-concerns-panel__content__title "
                headingLevel="h2"
                size="xl"
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
        cell={PlanConcernsRow}
        dataSource={[planConcernsConditionsPanelData ?? [], loaded, loadError]}
        fieldsMetadata={planConcernsPanelFields}
        namespace={namespace}
        showManageColumns={false}
        userSettings={userSettings}
      />
    </DrawerPanelContent>
  );
};

export default PlanConcernsPanel;
