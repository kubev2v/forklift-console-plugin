import React, { FC, useState } from 'react';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
  StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import { V1beta1PlanSpecVms, V1beta1PlanStatusMigrationVms } from '@kubev2v/types';

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
];

const PageWithSelection = StandardPageWithSelection<VMData>;
type PageWithSelectionProps = StandardPageWithSelectionProps<VMData>;
type PageGlobalActions = FC<GlobalActionWithSelection<VMData>>[];

export const PlanVirtualMachinesList: FC<{ obj: PlanData }> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const { plan } = obj;

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'PlanVirtualMachines' }));

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((m) => (vmDict[m.id] = m));

  const vmData: VMData[] = virtualMachines.map((m) => ({
    specVM: m,
    statusVM: vmDict[m.id],
    pods: [],
    jobs: [],
    targetNamespace: plan?.spec?.targetNamespace,
  }));

  const actions: PageGlobalActions = [
    ({ selectedIds }) => <PlanVMsDeleteButton selectedIds={selectedIds || []} plan={plan} />,
  ];

  const props: PageWithSelectionProps = {
    dataSource: [vmData || [], true, undefined],
    CellMapper: PlanVirtualMachinesRow,
    fieldsMetadata: fieldsMetadataFactory(t),
    title: t('Virtual Machines'),
    userSettings: userSettings,
    namespace: '',
    page,
    setPage,
  };

  const extendedProps = {
    ...props,
    toId: (item: VMData) => item?.specVM?.id,
    canSelect: (item: VMData) =>
      item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined,
    onSelect: setSelectedIds,
    selectedIds: selectedIds,
    GlobalActionToolbarItems: actions,
  };

  return <PageWithSelection {...extendedProps} />;
};
