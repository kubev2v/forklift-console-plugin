import React, { FC } from 'react';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import {
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

import { PlanVMsDeleteButton } from '../components';
import { PlanData, VMData } from '../types';

import { PlanVirtualMachinesRow } from './PlanVirtualMachinesRow';

const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.specVM.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true, // Name is sufficient ID when Namespace is pre-selected
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'conditions',
    jsonPath: (obj: VMData) => {
      return obj?.conditions?.[0]?.category;
    },
    label: t('Conditions'),
    isVisible: true,
    sortable: true,
  },
];

const PageWithSelection = StandardPageWithSelection<VMData>;
type PageGlobalActions = FC<GlobalActionWithSelection<VMData>>[];

export const PlanVirtualMachinesList: FC<{ obj: PlanData }> = ({ obj }) => {
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

  const vmData: VMData[] = virtualMachines.map((m) => ({
    specVM: m,
    statusVM: vmDict[m.id],
    pods: [],
    jobs: [],
    pvcs: [],
    dvs: [],
    conditions: conditionsDict[m.id],
    targetNamespace: plan?.spec?.targetNamespace,
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

  return (
    <PageWithSelection
      title={t('Virtual Machines')}
      dataSource={vmDataSource}
      CellMapper={PlanVirtualMachinesRow}
      fieldsMetadata={fieldsMetadataFactory(t)}
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
