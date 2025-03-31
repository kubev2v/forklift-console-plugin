import React, { type FC, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
  type StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import { TableSortContextProvider } from 'src/components/TableSortContext';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceFieldFactory } from '@components/common/utils/types';
import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1PlanSpecVms,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { MigrationVMsCancelButton, PlanVMsDeleteButton } from '../components';
import type { PlanData, VMData } from '../types';

import { MigrationVirtualMachinesRow } from './MigrationVirtualMachinesRow';
import { MigrationVirtualMachinesRowExtended } from './MigrationVirtualMachinesRowExtended';

const vmStatuses = [
  { id: 'Failed', label: 'Failed' },
  { id: 'Running', label: 'Running' },
  { id: 'Succeeded', label: 'Succeeded' },
  { id: 'Unknown', label: 'Unknown' },
  { id: 'Waiting', label: 'Waiting for cutover' },
  { id: 'NotStarted', label: 'Not started' },
];

const getVMMigrationStatus = (obj: VMData) => {
  const isError = obj.statusVM?.conditions?.find((c) => c.type === 'Failed' && c.status === 'True');
  const isSuccess = obj.statusVM?.conditions?.find(
    (c) => c.type === 'Succeeded' && c.status === 'True',
  );
  const isWaiting = obj.statusVM?.phase === 'CopyingPaused';
  const isRunning = obj.statusVM?.completed === undefined;
  const notStarted = obj.statusVM?.pipeline[0].phase === 'Pending';

  if (isError) {
    return 'Failed';
  }

  if (isSuccess) {
    return 'Succeeded';
  }

  if (isWaiting) {
    return 'Waiting';
  }

  if (notStarted) {
    return 'NotStarted';
  }

  if (isRunning) {
    return 'Running';
  }

  return 'Unknown';
};

const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
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
    filter: {
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
      placeholderLabel: 'YYYY-MM-DD',
      type: 'dateRange',
    },
    isVisible: true,
    jsonPath: '$.statusVM.started',
    label: t('Started at'),
    resourceFieldId: 'migrationStarted',
    sortable: true,
  },
  {
    filter: {
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
      placeholderLabel: 'YYYY-MM-DD',
      type: 'dateRange',
    },
    isVisible: true,
    jsonPath: '$.statusVM.completed',
    label: t('Completed at'),
    resourceFieldId: 'migrationCompleted',
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: (obj: VMData) => {
      const diskTransfer = obj.statusVM?.pipeline.find((p) => p.name === 'DiskTransfer');

      return diskTransfer?.progress?.total
        ? diskTransfer?.progress?.completed / diskTransfer?.progress?.total
        : 0;
    },
    label: t('Disk transfer'),
    resourceFieldId: 'transfer',
  },
  {
    isVisible: true,
    jsonPath: (obj: VMData) => {
      const diskTransfer = obj.statusVM?.pipeline.find((p) => p.name === 'DiskTransfer');

      return diskTransfer?.progress?.total
        ? diskTransfer?.progress?.completed / diskTransfer?.progress?.total
        : 0;
    },
    label: t('Disk counter'),
    resourceFieldId: 'diskCounter',
  },
  {
    filter: {
      placeholderLabel: t('Pipeline status'),
      primary: true,
      type: 'enum',
      values: vmStatuses,
    },
    isVisible: true,
    jsonPath: getVMMigrationStatus,
    label: t('Pipeline status'),
    resourceFieldId: 'status',
    sortable: true,
  },
];

const PageWithSelection = StandardPageWithSelection<VMData>;
type PageWithSelectionProps = StandardPageWithSelectionProps<VMData>;
type PageGlobalActions = FC<GlobalActionWithSelection<VMData>>[];

export const MigrationVirtualMachinesList: FC<{ obj: PlanData }> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { plan } = obj;

  const [lastMigration] = usePlanMigration(plan);

  const [pods, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    isList: true,
    kind: 'Pod',
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const podsDict: Record<string, IoK8sApiCoreV1Pod[]> = {};
  (pods && loaded && !loadError ? pods : []).forEach((p) =>
    podsDict[p.metadata.labels.vmID]
      ? podsDict[p.metadata.labels.vmID].push(p)
      : (podsDict[p.metadata.labels.vmID] = [p]),
  );

  const [jobs, jobsLoaded, jobsLoadError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: { group: 'batch', kind: 'Job', version: 'v1' },
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const jobsDict: Record<string, IoK8sApiBatchV1Job[]> = {};
  (jobs && jobsLoaded && !jobsLoadError ? jobs : []).forEach((j) =>
    jobsDict[j.metadata.labels.vmID]
      ? jobsDict[j.metadata.labels.vmID].push(j)
      : (jobsDict[j.metadata.labels.vmID] = [j]),
  );

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: { kind: 'PersistentVolumeClaim', version: 'v1' },
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const pvcsDict: Record<string, IoK8sApiCoreV1PersistentVolumeClaim[]> = {};
  (pvcs && pvcsLoaded && !pvcsLoadError ? pvcs : []).forEach((p) =>
    pvcsDict[p.metadata.labels.vmID]
      ? pvcsDict[p.metadata.labels.vmID].push(p)
      : (pvcsDict[p.metadata.labels.vmID] = [p]),
  );

  const [dvs, dvsLoaded, dvsLoadError] = useK8sWatchResource<V1beta1DataVolume[]>({
    groupVersionKind: {
      group: 'cdi.kubevirt.io',
      kind: 'DataVolume',
      version: 'v1beta1',
    },
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const dvsDict: Record<string, V1beta1DataVolume[]> = {};
  (dvs && dvsLoaded && !dvsLoadError ? dvs : []).forEach((p) =>
    dvsDict[p.metadata.labels.vmID]
      ? dvsDict[p.metadata.labels.vmID].push(p)
      : (dvsDict[p.metadata.labels.vmID] = [p]),
  );

  const [expandedIds, setExpandedIds] = useState([]);

  const userSettings = loadUserSettings({ pageId: 'PlanVirtualMachines' });

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((m) => (vmDict[m.id] = m));

  const vmData: VMData[] = virtualMachines.map((m) => ({
    dvs: dvsDict[m.id],
    jobs: jobsDict[m.id],
    pods: podsDict[m.id],
    pvcs: pvcsDict[m.id],
    specVM: m,
    statusVM: vmDict[m.id],
    targetNamespace: plan?.spec?.targetNamespace,
  }));

  const isExecuting = isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);

  // If plan executing and not archived (happens when archiving a running plan), allow to cancel vms, o/w remove from plan
  let actions: PageGlobalActions;
  if (isExecuting && !isArchived) {
    actions = [
      ({ selectedIds }) => (
        <MigrationVMsCancelButton selectedIds={selectedIds || []} migration={lastMigration} />
      ),
    ];
  } else {
    actions = [
      ({ selectedIds }) => <PlanVMsDeleteButton selectedIds={selectedIds || []} plan={plan} />,
    ];
  }

  const canSelectWhenExecuting = (item: VMData) =>
    item?.statusVM?.completed === undefined && isExecuting;

  const canSelectWhenNotExecuting = (item: VMData) =>
    (item?.statusVM?.started === undefined || item?.statusVM?.error !== undefined) && !isExecuting;

  const fieldsMetadata = fieldsMetadataFactory(t);
  const props: PageWithSelectionProps = {
    CellMapper: MigrationVirtualMachinesRow,
    dataSource: [vmData || [], true, undefined],
    ExpandedComponent: MigrationVirtualMachinesRowExtended,
    fieldsMetadata,
    namespace: '',
    page: 1,
    title: t('Virtual Machines'),
    userSettings,
  };

  const extendedProps = {
    ...props,
    canSelect: (item: VMData) => canSelectWhenExecuting(item) || canSelectWhenNotExecuting(item),
    expandedIds,
    GlobalActionToolbarItems: actions,
    onExpand: setExpandedIds,
    onSelect: () => undefined,
    selectedIds: [],
    toId: (item: VMData) => item?.specVM?.id,
  };

  return (
    <TableSortContextProvider fields={fieldsMetadata}>
      <PageWithSelection {...extendedProps} />
    </TableSortContextProvider>
  );
};
