import { type FC, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import {
  type GlobalActionWithSelection,
  StandardPageWithSelection,
  type StandardPageWithSelectionProps,
} from 'src/components/page/StandardPageWithSelection';
import { TableSortContextProvider } from 'src/components/TableSortContext';
import { usePlanMigration } from 'src/modules/Plans/hooks/usePlanMigration';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import type { PlanData } from 'src/modules/Plans/utils/types/PlanData';
import { useForkliftTranslation } from 'src/utils/i18n';

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
import { t } from '@utils/i18n';

import { MigrationVMsCancelButton } from '../components/MigrationVMsCancelButton';
import { PlanVMsDeleteButton } from '../components/PlanVMsDeleteButton';
import type { VMData } from '../types/VMData';

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
  const isError = obj.statusVM?.conditions?.find(
    (condition) => condition.type === 'Failed' && condition.status === 'True',
  );
  const isSuccess = obj.statusVM?.conditions?.find(
    (condition) => condition.type === 'Succeeded' && condition.status === 'True',
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

const fieldsMetadata = [
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
      const diskTransfer = obj.statusVM?.pipeline.find((pipe) => pipe.name === 'DiskTransfer');

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
      const diskTransfer = obj.statusVM?.pipeline.find((pipe) => pipe.name === 'DiskTransfer');

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

export const MigrationVirtualMachinesList: FC<{ planData: PlanData }> = ({ planData }) => {
  const { t } = useForkliftTranslation();
  const { plan } = planData;

  const [lastMigration] = usePlanMigration(plan);

  const [pods, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    isList: true,
    kind: 'Pod',
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const podsDict: Record<string, IoK8sApiCoreV1Pod[]> = {};
  (pods && loaded && !loadError ? pods : []).forEach((pod) =>
    podsDict[pod.metadata.labels.vmID]
      ? podsDict[pod.metadata.labels.vmID].push(pod)
      : (podsDict[pod.metadata.labels.vmID] = [pod]),
  );

  const [jobs, jobsLoaded, jobsLoadError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: { group: 'batch', kind: 'Job', version: 'v1' },
    isList: true,
    namespace: plan?.spec?.targetNamespace,
    namespaced: true,
    selector: { matchLabels: { plan: plan?.metadata?.uid } },
  });

  const jobsDict: Record<string, IoK8sApiBatchV1Job[]> = {};
  (jobs && jobsLoaded && !jobsLoadError ? jobs : []).forEach((job) =>
    jobsDict[job.metadata.labels.vmID]
      ? jobsDict[job.metadata.labels.vmID].push(job)
      : (jobsDict[job.metadata.labels.vmID] = [job]),
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
  (pvcs && pvcsLoaded && !pvcsLoadError ? pvcs : []).forEach((pvc) =>
    pvcsDict[pvc.metadata.labels.vmID]
      ? pvcsDict[pvc.metadata.labels.vmID].push(pvc)
      : (pvcsDict[pvc.metadata.labels.vmID] = [pvc]),
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
  (dvs && dvsLoaded && !dvsLoadError ? dvs : []).forEach((dataVolume) =>
    dvsDict[dataVolume.metadata.labels.vmID]
      ? dvsDict[dataVolume.metadata.labels.vmID].push(dataVolume)
      : (dvsDict[dataVolume.metadata.labels.vmID] = [dataVolume]),
  );

  const [expandedIds, setExpandedIds] = useState([]);

  const userSettings = loadUserSettings({ pageId: 'PlanVirtualMachines' });

  const virtualMachines: V1beta1PlanSpecVms[] = plan?.spec?.vms || [];
  const migrationVirtualMachines: V1beta1PlanStatusMigrationVms[] =
    plan?.status?.migration?.vms || [];

  const vmDict: Record<string, V1beta1PlanStatusMigrationVms> = {};
  migrationVirtualMachines.forEach((migration) => (vmDict[migration.id] = migration));

  const vmData: VMData[] = virtualMachines.map((vmSpec) => ({
    dvs: dvsDict[vmSpec.id],
    jobs: jobsDict[vmSpec.id],
    pods: podsDict[vmSpec.id],
    pvcs: pvcsDict[vmSpec.id],
    specVM: vmSpec,
    statusVM: vmDict[vmSpec.id],
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
