import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import { ConcernsTable } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/ConcernsTable';
import { useForkliftTranslation } from 'src/utils/i18n';

import { INITIAL_PAGE } from '@components/page/utils/constants';
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
      title={t('Virtual machiness')}
      data-testid="plan-spec-virtual-machines-list"
      dataSource={[specVirtualMachinesListData ?? [], !loading, inventoryError]}
      CellMapper={PlanSpecVirtualMachinesRow}
      fieldsMetadata={specVirtualMachineFields}
      userSettings={userSettings}
      namespace={''}
      page={INITIAL_PAGE}
      toId={vmDataToId}
      canSelect={canSelect}
      onSelect={() => undefined}
      selectedIds={[]}
      GlobalActionToolbarItems={actions}
      ExpandedComponent={(props) => <ConcernsTable {...props} />}
      expandedIds={[]}
    />
  );
};

export default PlanSpecVirtualMachinesList;
