import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import {
  extraSupportedFilters,
  extraSupportedMatchers,
} from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ConcernsAndConditionsTable from '@components/ConcernsAndConditionsTable/ConcernsAndConditionsTable';
import type { V1beta1Plan } from '@kubev2v/types';

import { PLAN_VIRTUAL_MACHINES_LIST_ID } from '../utils/constants';

import { useSpecVirtualMachinesActions } from './hooks/useSpecVirtualMachinesActions';
import { useSpecVirtualMachinesListData } from './hooks/useSpecVirtualMachinesListData';
import type { SpecVirtualMachinePageData } from './utils/types';
import { canSelect, specVirtualMachineFields, vmDataToId } from './utils/utils';
import PlanSpecVirtualMachinesRow from './PlanSpecVirtualMachinesRow';

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

  return (
    <StandardPageWithSelection<SpecVirtualMachinePageData>
      title={t('Virtual machines')}
      data-testid="plan-spec-virtual-machines-list"
      dataSource={[specVirtualMachinesListData ?? [], !loading, inventoryError]}
      cell={PlanSpecVirtualMachinesRow}
      fieldsMetadata={specVirtualMachineFields}
      userSettings={userSettings}
      toId={vmDataToId}
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={selectedIds}
      GlobalActionToolbarItems={actions}
      expanded={(props) => <ConcernsAndConditionsTable vmData={props.resourceData} />}
      expandedIds={expandedIds}
      extraSupportedMatchers={extraSupportedMatchers}
      extraSupportedFilters={extraSupportedFilters}
    />
  );
};

export default PlanSpecVirtualMachinesList;
