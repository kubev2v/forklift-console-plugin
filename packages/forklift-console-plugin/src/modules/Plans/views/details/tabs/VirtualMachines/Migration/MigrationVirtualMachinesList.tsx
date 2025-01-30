import React, { FC, useState } from 'react';
import {
  GlobalActionWithSelection,
  StandardPageWithSelection,
  StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import {
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
import { PlanData, VMData } from '../types';

import { MigrationVirtualMachinesRow } from './MigrationVirtualMachinesRow';
import { MigrationVirtualMachinesRowExtended } from './MigrationVirtualMachinesRowExtended';

const vmStatuses = [
  { id: 'Failed', label: 'Failed' },
  { id: 'Running', label: 'Running' },
  { id: 'Succeeded', label: 'Succeeded' },
  { id: 'Unknown', label: 'Unknown' },
];

export const getVMMigrationStatus = (statusVM: V1beta1PlanStatusMigrationVms) => {
  const isError = statusVM?.conditions?.find((c) => c.type === 'Failed' && c.status === 'True');
  const isSuccess = statusVM?.conditions?.find(
    (c) => c.type === 'Succeeded' && c.status === 'True',
  );
  const isRunning = statusVM?.completed === undefined;

  if (isError) {
    return 'Failed';
  }

  if (isSuccess) {
    return 'Succeeded';
  }

  if (isRunning) {
    return 'Running';
  }

  return 'Unknown';
};

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
    resourceFieldId: 'migrationStarted',
    jsonPath: '$.statusVM.started',
    label: t('Started at'),
    isVisible: true,
    filter: {
      type: 'dateRange',
      placeholderLabel: 'YYYY-MM-DD',
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'migrationCompleted',
    jsonPath: '$.statusVM.completed',
    label: t('Completed at'),
    isVisible: true,
    filter: {
      type: 'dateRange',
      placeholderLabel: 'YYYY-MM-DD',
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'transfer',
    jsonPath: (obj: VMData) => {
      const diskTransfer = obj.statusVM?.pipeline.find((p) => p.name === 'DiskTransfer');

      return diskTransfer && diskTransfer?.progress?.total
        ? diskTransfer?.progress?.completed / diskTransfer?.progress?.total
        : 0;
    },
    label: t('Disk transfer'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'diskCounter',
    jsonPath: (obj: VMData) => {
      const diskTransfer = obj.statusVM?.pipeline.find((p) => p.name === 'DiskTransfer');

      return diskTransfer && diskTransfer?.progress?.total
        ? diskTransfer?.progress?.completed / diskTransfer?.progress?.total
        : 0;
    },
    label: t('Disk counter'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'status',
    jsonPath: getVMMigrationStatus,
    label: t('Pipeline status'),
    isVisible: true,
    sortable: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Pipeline status'),
      values: vmStatuses,
    },
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
    kind: 'Pod',
    namespaced: true,
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const podsDict: Record<string, IoK8sApiCoreV1Pod[]> = {};
  (pods && loaded && !loadError ? pods : []).forEach((p) =>
    podsDict[p.metadata.labels.vmID]
      ? podsDict[p.metadata.labels.vmID].push(p)
      : (podsDict[p.metadata.labels.vmID] = [p]),
  );

  const [jobs, jobsLoaded, jobsLoadError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: { kind: 'Job', group: 'batch', version: 'v1' },
    namespaced: true,
    isList: true,
    namespace: plan?.spec?.targetNamespace,
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
    namespaced: true,
    isList: true,
    namespace: plan?.spec?.targetNamespace,
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
      version: 'v1beta1',
      kind: 'DataVolume',
      group: 'cdi.kubevirt.io',
    },
    namespaced: true,
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const dvsDict: Record<string, V1beta1DataVolume[]> = {};
  (dvs && dvsLoaded && !dvsLoadError ? dvs : []).forEach((p) =>
    dvsDict[p.metadata.labels.vmID]
      ? dvsDict[p.metadata.labels.vmID].push(p)
      : (dvsDict[p.metadata.labels.vmID] = [p]),
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);

  const userSettings = loadUserSettings({ pageId: 'PlanVirtualMachines' });

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((m) => (vmDict[m.id] = m));

  const vmData: VMData[] = virtualMachines.map((m) => ({
    specVM: m,
    statusVM: vmDict[m.id],
    pods: podsDict[m.id],
    jobs: jobsDict[m.id],
    pvcs: pvcsDict[m.id],
    dvs: dvsDict[m.id],
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

  const props: PageWithSelectionProps = {
    dataSource: [vmData || [], true, undefined],
    CellMapper: MigrationVirtualMachinesRow,
    ExpandedComponent: MigrationVirtualMachinesRowExtended,
    fieldsMetadata: fieldsMetadataFactory(t),
    title: t('Virtual Machines'),
    userSettings: userSettings,
    namespace: '',
    page: 1,
  };

  const extendedProps = {
    ...props,
    toId: (item: VMData) => item?.specVM?.id,
    canSelect: (item: VMData) => canSelectWhenExecuting(item) || canSelectWhenNotExecuting(item),
    onSelect: setSelectedIds,
    selectedIds: selectedIds,
    onExpand: setExpandedIds,
    expandedIds: expandedIds,
    GlobalActionToolbarItems: actions,
  };

  return <PageWithSelection {...extendedProps} />;
};
