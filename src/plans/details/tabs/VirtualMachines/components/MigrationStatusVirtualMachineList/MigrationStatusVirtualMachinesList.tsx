import { type FC, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import { TableSortContextProvider } from 'src/components/TableSortContext';
import { isPlanExecuting } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { INITIAL_PAGE } from '@components/page/utils/constants';
import type { V1beta1Plan } from '@kubev2v/types';

import { PLAN_VIRTUAL_MACHINES_LIST_ID } from '../utils/constants';

import MigrationStatusExpandedPage from './components/MigrationStatusExpandedPage/MigrationStatusExpandedPage';
import { useMigrationResources } from './hooks/useMigrationResources';
import { useMigrationVirtualMachineActions } from './hooks/useMigrationVirtualMachineActions';
import { planMigrationVirtualMachinesFields } from './utils/constants';
import type { MigrationStatusVirtualMachinePageData } from './utils/types';
import MigrationStatusVirtualMachinesRow from './MigrationStatusVirtualMachinesRow';

type MigrationStatusVirtualMachinesListProps = {
  plan: V1beta1Plan;
};

const MigrationStatusVirtualMachinesList: FC<MigrationStatusVirtualMachinesListProps> = ({
  plan,
}) => {
  const { t } = useForkliftTranslation();
  const userSettings = useMemo(
    () => loadUserSettings({ pageId: PLAN_VIRTUAL_MACHINES_LIST_ID }),
    [],
  );
  const { migrationListData } = useMigrationResources(plan);
  const actions = useMigrationVirtualMachineActions(plan);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const isExecuting = isPlanExecuting(plan);

  const canSelectWhenExecuting = (item: MigrationStatusVirtualMachinePageData) =>
    item?.statusVM?.completed === undefined && isExecuting;

  const canSelectWhenNotExecuting = (item: MigrationStatusVirtualMachinePageData) =>
    (item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined) && !isExecuting;

  return (
    <TableSortContextProvider fields={planMigrationVirtualMachinesFields}>
      <StandardPageWithSelection<MigrationStatusVirtualMachinePageData>
        canSelect={(item: MigrationStatusVirtualMachinePageData) =>
          canSelectWhenExecuting(item) ?? canSelectWhenNotExecuting(item)
        }
        CellMapper={MigrationStatusVirtualMachinesRow}
        dataSource={[migrationListData ?? [], true, undefined]}
        ExpandedComponent={MigrationStatusExpandedPage}
        expandedIds={expandedIds}
        fieldsMetadata={planMigrationVirtualMachinesFields}
        GlobalActionToolbarItems={actions}
        namespace={''}
        onExpand={setExpandedIds}
        onSelect={() => undefined}
        page={INITIAL_PAGE}
        selectedIds={[]}
        title={t('Virtual machines')}
        toId={(item: MigrationStatusVirtualMachinePageData) => item?.specVM?.id ?? ''}
        userSettings={userSettings}
      />
    </TableSortContextProvider>
  );
};

export default MigrationStatusVirtualMachinesList;
