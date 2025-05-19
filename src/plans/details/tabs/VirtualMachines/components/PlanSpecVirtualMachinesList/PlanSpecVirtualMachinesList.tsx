import type { FC } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { INITIAL_PAGE } from '@components/page/utils/constants';
import type { V1beta1Plan } from '@kubev2v/types';

import { PLAN_VIRTUAL_MACHINES_LIST_ID } from '../utils/constants';

import { useSpecVirtualMachinesActions } from './hooks/useSpecVirtualMachinesActions';
import { useSpecVirtualMachinesListData } from './hooks/useSpecVirtualMachinesListData';
import type { SpecVirtualMachinePageData } from './utils/types';
import { canSelect, getSpecVirtualMachineFields, vmDataToId } from './utils/utils';
import PlanSpecVirtualMachinesRow from './PlanSpecVirtualMachinesRow';

type PlanVirtualMachinesListProps = {
  plan: V1beta1Plan;
};

const PlanSpecVirtualMachinesList: FC<PlanVirtualMachinesListProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: PLAN_VIRTUAL_MACHINES_LIST_ID });

  const specVirtualMachinesListData = useSpecVirtualMachinesListData(plan);
  const actions = useSpecVirtualMachinesActions(plan);
  const { sourceProvider } = usePlanSourceProvider(plan);

  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  return (
    <StandardPageWithSelection<SpecVirtualMachinePageData>
      title={t('Virtual Machines')}
      data-testid="plan-spec-virtual-machines-list"
      dataSource={[specVirtualMachinesListData ?? [], true, undefined]}
      CellMapper={PlanSpecVirtualMachinesRow}
      fieldsMetadata={getSpecVirtualMachineFields(isVsphere)}
      userSettings={userSettings}
      namespace={''}
      page={INITIAL_PAGE}
      toId={vmDataToId}
      canSelect={canSelect}
      onSelect={() => undefined}
      selectedIds={[]}
      GlobalActionToolbarItems={actions}
    />
  );
};

export default PlanSpecVirtualMachinesList;
