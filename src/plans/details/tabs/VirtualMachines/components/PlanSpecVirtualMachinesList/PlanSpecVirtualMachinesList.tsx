import { type FC, useCallback, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import InspectionExpandedSection from 'src/components/InspectVirtualMachines/InspectionExpandedSection';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import {
  extraSupportedFilters,
  extraSupportedMatchers,
} from 'src/providers/details/tabs/VirtualMachines/components/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ConcernsAndConditionsTable from '@components/ConcernsAndConditionsTable/ConcernsAndConditionsTable';
import type { V1beta1Plan } from '@forklift-ui/types';
import { Stack, StackItem } from '@patternfly/react-core';

import { PLAN_VIRTUAL_MACHINES_LIST_ID } from '../utils/constants';

import { useInspectionData } from './hooks/useInspectionData';
import { useSpecVirtualMachinesActions } from './hooks/useSpecVirtualMachinesActions';
import { useSpecVirtualMachinesListData } from './hooks/useSpecVirtualMachinesListData';
import type { SpecVirtualMachinePageData } from './utils/types';
import { canSelect, specVirtualMachineFields, vmDataToId } from './utils/utils';
import PlanSpecVirtualMachinesRow from './PlanSpecVirtualMachinesRow';

import 'src/components/InspectVirtualMachines/InspectionExpandedSection.scss';

type PlanVirtualMachinesListProps = {
  plan: V1beta1Plan;
};

const selectedIds: string[] = [];
const expandedIds: string[] = [];
const onSelect = () => undefined;

const PlanSpecVirtualMachinesList: FC<PlanVirtualMachinesListProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const userSettings = useMemo(
    () => loadUserSettings({ pageId: PLAN_VIRTUAL_MACHINES_LIST_ID }),
    [],
  );

  const [specVirtualMachinesListData, loading, inventoryError] =
    useSpecVirtualMachinesListData(plan);

  const actions = useSpecVirtualMachinesActions(plan);

  const { conversions, enrichData, inspectionExpandedRows, setInspectionExpandedRows } =
    useInspectionData(plan);

  const enrichedData = useMemo(
    () => enrichData(specVirtualMachinesListData ?? []),
    [specVirtualMachinesListData, enrichData],
  );

  const expanded = useCallback(
    (props: { resourceData: SpecVirtualMachinePageData }) => {
      const vmId = props.resourceData?.specVM?.id ?? '';
      return (
        <Stack hasGutter>
          <StackItem>
            <ConcernsAndConditionsTable vmData={props.resourceData} />
          </StackItem>
          <StackItem className="forklift-inspection-expanded-section">
            <InspectionExpandedSection
              conversions={conversions}
              vmId={vmId}
              expandedRows={inspectionExpandedRows}
              onToggleExpand={setInspectionExpandedRows}
            />
          </StackItem>
        </Stack>
      );
    },
    [conversions, inspectionExpandedRows, setInspectionExpandedRows],
  );

  return (
    <StandardPageWithSelection<SpecVirtualMachinePageData>
      title={t('Virtual machines')}
      data-testid="plan-spec-virtual-machines-list"
      dataSource={[enrichedData, !loading, inventoryError]}
      cell={PlanSpecVirtualMachinesRow}
      fieldsMetadata={specVirtualMachineFields}
      userSettings={userSettings}
      toId={vmDataToId}
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={selectedIds}
      GlobalActionToolbarItems={actions}
      expanded={expanded}
      expandedIds={expandedIds}
      extraSupportedMatchers={extraSupportedMatchers}
      extraSupportedFilters={extraSupportedFilters}
    />
  );
};

export default PlanSpecVirtualMachinesList;
