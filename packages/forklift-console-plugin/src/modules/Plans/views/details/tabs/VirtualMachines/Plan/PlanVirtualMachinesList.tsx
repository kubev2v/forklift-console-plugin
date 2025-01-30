import React, { FC } from 'react';
import { StandardPage } from 'src/components/page/StandardPage';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
} from 'src/components/page/StandardPageWithSelection';
import { getPlanPhase, PlanPhase } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import {
  V1beta1PlanSpecVms,
  V1beta1PlanStatusConditions,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

import { PlanVMsDeleteButton, PlanVMsEditButton } from '../components';
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

  const phase = getPlanPhase({ obj: plan });
  type PageGlobalActions = FC<GlobalActionWithSelection<VMData>>[];

  const commonProps = {
    title: t('Virtual Machines'),
    dataSource: vmDataSource,
    CellMapper: PlanVirtualMachinesRow,
    fieldsMetadata: fieldsMetadataFactory(t),
    userSettings: userSettings,
    namespace: '',
    page: 1,
    toId: vmDataToId,
  };

  return phase === PlanPhase.Ready ? (
    <StandardPage<VMData>
      {...commonProps}
      GlobalActionToolbarItems={[() => <PlanVMsEditButton plan={plan} />]}
    />
  ) : (
    <StandardPageWithSelection<VMData>
      {...commonProps}
      GlobalActionToolbarItems={
        [
          ({ selectedIds }) => <PlanVMsDeleteButton selectedIds={selectedIds || []} plan={plan} />,
        ] as PageGlobalActions
      }
      canSelect={canSelect}
      onSelect={onSelect}
      selectedIds={initialSelectedIds}
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
