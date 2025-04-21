import type { FC } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import type { PlanData } from 'src/modules/Plans/utils/types/PlanData';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceField } from '@components/common/utils/types';
import type {
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
  V1beta1Provider,
} from '@kubev2v/types';
import { t } from '@utils/i18n';

import { PlanVMsDeleteButton } from '../components/PlanVMsDeleteButton';
import type { VMData } from '../types/VMData';

import { PlanVirtualMachinesRow } from './PlanVirtualMachinesRow';

const fieldsMetadata: (isVsphere: boolean) => ResourceField[] = (isVsphere) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: 'freetext',
    },
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    isVisible: true,
    jsonPath: '$.specVM.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: (obj: VMData) => {
      return obj?.conditions?.[0]?.category;
    },
    label: t('Conditions'),
    resourceFieldId: 'conditions',
    sortable: true,
  },
  {
    isAction: true,
    isHidden: !isVsphere,
    isVisible: true,
    label: '',
    resourceFieldId: 'actions',
    sortable: false,
  },
];

const PageWithSelection = StandardPageWithSelection<VMData>;
type PageGlobalActions = FC<GlobalActionWithSelection<VMData>>[];

export const PlanVirtualMachinesList: FC<{
  planData: PlanData;
  sourceProvider?: V1beta1Provider;
}> = ({ planData, sourceProvider }) => {
  const { t } = useForkliftTranslation();

  const { plan } = planData;

  const userSettings = loadUserSettings({ pageId: 'PlanVirtualMachines' });

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((migration) => (vmDict[migration.id] = migration));

  const conditions = plan?.status?.conditions?.filter(
    (condition) => condition?.items && condition.items.length > 0,
  );
  const conditionsDict: Record<string, V1beta1PlanStatusConditions[]> = {};
  conditions?.forEach((condition) => {
    condition.items.forEach((i) => {
      const { id: vmID } = extractIdAndNameFromConditionItem(i);
      conditionsDict[vmID]
        ? conditionsDict[vmID].push(condition)
        : (conditionsDict[vmID] = [condition]);
    });
  });

  const vmData: VMData[] = virtualMachines.map((vm, index) => ({
    conditions: conditionsDict[vm.id],
    dvs: [],
    jobs: [],
    planData,
    pods: [],
    pvcs: [],
    specVM: vm,
    statusVM: vmDict[vm.id],
    targetNamespace: plan?.spec?.targetNamespace,
    vmIndex: index,
  }));
  const vmDataSource: [VMData[], boolean, unknown] = [vmData || [], true, undefined];
  const vmDataToId = (item: VMData) => item?.specVM?.id;
  const canSelect = (item: VMData) =>
    item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined;
  const onSelect = () => undefined;
  const initialSelectedIds = [];

  const actions: PageGlobalActions = [
    ({ selectedIds }) => <PlanVMsDeleteButton selectedIds={selectedIds || []} plan={plan} />,
  ];

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';

  return (
    <PageWithSelection
      title={t('Virtual Machines')}
      dataSource={vmDataSource}
      CellMapper={PlanVirtualMachinesRow}
      fieldsMetadata={fieldsMetadata(isVsphere)}
      userSettings={userSettings}
      namespace={''}
      page={1}
      toId={vmDataToId}
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={initialSelectedIds}
      GlobalActionToolbarItems={actions}
    />
  );
};

/**
 * Extracts the ID and name from a condition item string.
 *
 * This function parses a string containing condition item details and extracts the ID and name.
 * The string format expected is something like "id:<some_id> name:'<some_name>'".
 *
 * @param {string} input - The string containing the condition item details.
 * @returns {{ id: string; name: string }} An object containing the extracted ID and name.
 */
const extractIdAndNameFromConditionItem = (input: string): { id: string; name: string } => {
  const idMatch = /id:(?<id>[^ ]+)/u.exec(input);
  const nameMatch = /name:'(?<name>[^']+)'/u.exec(input);

  if (!idMatch || !nameMatch) {
    return { id: '', name: '' };
  }

  return {
    id: idMatch.groups?.id ?? '',
    name: nameMatch?.groups?.name ?? '',
  };
};
