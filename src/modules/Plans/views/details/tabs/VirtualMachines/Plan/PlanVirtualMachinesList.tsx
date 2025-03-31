import React, { type FC } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceFieldFactory } from '@components/common/utils/types';
import type {
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
  V1beta1Provider,
} from '@kubev2v/types';

import { PlanVMsDeleteButton } from '../components';
import type { PlanData, VMData } from '../types';

import { PlanVirtualMachinesRow } from './PlanVirtualMachinesRow';

const fieldsMetadataFactory: (isVsphere: boolean) => ResourceFieldFactory = (isVsphere) => (t) => [
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
  obj: PlanData;
  sourceProvider?: V1beta1Provider;
}> = ({ obj, sourceProvider }) => {
  const { t } = useForkliftTranslation();

  const { plan } = obj;

  const userSettings = loadUserSettings({ pageId: 'PlanVirtualMachines' });

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((m) => (vmDict[m.id] = m));

  const conditions = plan?.status?.conditions?.filter((c) => c?.items && c.items.length > 0);
  const conditionsDict: Record<string, V1beta1PlanStatusConditions[]> = {};
  conditions?.forEach((c) => {
    c.items.forEach((i) => {
      const { id: vmID } = extractIdAndNameFromConditionItem(i);
      conditionsDict[vmID] ? conditionsDict[vmID].push(c) : (conditionsDict[vmID] = [c]);
    });
  });

  const vmData: VMData[] = virtualMachines.map((vm, index) => ({
    conditions: conditionsDict[vm.id],
    dvs: [],
    jobs: [],
    planData: obj,
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
      fieldsMetadata={fieldsMetadataFactory(isVsphere)(t)}
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
function extractIdAndNameFromConditionItem(input: string): { id: string; name: string } {
  const idMatch = /id:([^ ]+)/.exec(input);
  const nameMatch = /name:'([^']+)'/.exec(input);

  if (!idMatch || !nameMatch) {
    return { id: '', name: '' };
  }

  return {
    id: idMatch[1],
    name: nameMatch[1],
  };
}
