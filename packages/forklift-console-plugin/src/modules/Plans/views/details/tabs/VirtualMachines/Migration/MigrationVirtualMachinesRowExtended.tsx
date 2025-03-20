import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp';
import SectionHeading from 'src/components/headers/SectionHeading';
import StatusIcon from 'src/components/status/StatusIcon';
import { useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { RowProps } from '@kubev2v/common';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1Pod,
  V1beta1PlanStatusMigrationVmsPipeline,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import {
  Button,
  PageSection,
  ProgressStep,
  ProgressStepper,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { TaskIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { hasTaskCompleted } from '../../../utils';
import { PipelineTasksModal } from '../modals';
import { VMData } from '../types';

import { getIcon, getVariant } from './MigrationVirtualMachinesRow';

export const MigrationVirtualMachinesRowExtended: React.FC<RowProps<VMData>> = (props) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const pipeline = props.resourceData.statusVM?.pipeline || [];
  const conditions = props.resourceData.statusVM?.conditions || [];
  const pods = props.resourceData.pods;
  const jobs = props.resourceData.jobs;
  const pvcs = props.resourceData.pvcs;
  const dvs = props.resourceData.dvs;
  const vmCreated = pipeline.find(
    (p) => p?.name === 'VirtualMachineCreation' && p?.phase === 'Completed',
  );

  const getPodLogsLink = (pod: IoK8sApiCoreV1Pod) =>
    getResourceUrl({
      reference: 'pods',
      namespace: pod.metadata.namespace,
      name: pod.metadata.name,
    });

  const getStatusLabel = (phase: string) => {
    return (
      <Split>
        <SplitItem className="forklift-overview__controller-card__status-icon">
          <StatusIcon phase={phase} />
        </SplitItem>
        <SplitItem>{phase}</SplitItem>
      </Split>
    );
  };

  return (
    <PageSection>
      {vmCreated && (
        <>
          <SectionHeading
            text={'Virtual machine'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Name')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr key="vm">
                <Td>
                  <ResourceLink
                    groupVersionKind={{
                      group: 'kubevirt.io',
                      version: 'v1',
                      kind: 'VirtualMachine',
                    }}
                    name={props.resourceData.statusVM?.name}
                    namespace={props.resourceData.targetNamespace}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </>
      )}

      {(pods || []).length > 0 && (
        <>
          <SectionHeading
            text={'Pods'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Pod')}</Th>
                <Th>{t('Status')}</Th>
                <Th>{t('Pod logs')}</Th>
                <Th>{t('Created at')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(pods || []).map((pod) => (
                <Tr key={pod.metadata.uid}>
                  <Td>
                    <ResourceLink
                      kind={pod?.kind}
                      name={pod?.metadata?.name}
                      namespace={pod?.metadata?.namespace}
                    />
                  </Td>
                  <Td>{getStatusLabel(pod?.status?.phase)}</Td>
                  <Td>
                    <Link to={`${getPodLogsLink(pod)}/logs`}>{t('Logs')}</Link>
                  </Td>
                  <Td>
                    <ConsoleTimestamp timestamp={pod?.metadata?.creationTimestamp} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {(jobs || []).length > 0 && (
        <>
          <SectionHeading
            text={'Jobs'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Name')}</Th>
                <Th>{t('Status')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(jobs || []).map((job) => (
                <Tr key={job.metadata.uid}>
                  <Td>
                    <ResourceLink
                      groupVersionKind={{ group: 'batch', version: 'v1', kind: 'Job' }}
                      name={job?.metadata?.name}
                      namespace={job?.metadata?.namespace}
                    />
                  </Td>
                  <Td>
                    <Status status={getJobPhase(job)}></Status>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {(pvcs || []).length > 0 && (
        <>
          <SectionHeading
            text={'PersistentVolumeClaims'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Name')}</Th>
                <Th>{t('Status')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(pvcs || []).map((pvc) => (
                <Tr key={pvc.metadata.uid}>
                  <Td>
                    <ResourceLink
                      groupVersionKind={{ version: 'v1', kind: 'PersistentVolumeClaim' }}
                      name={pvc?.metadata?.name}
                      namespace={pvc?.metadata?.namespace}
                    />
                  </Td>
                  <Td>
                    <Status status={pvc.status.phase}></Status>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {(dvs || []).length > 0 && (
        <>
          <SectionHeading
            text={'DataVolumes'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Name')}</Th>
                <Th>{t('Status')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(dvs || []).map((dv) => (
                <Tr key={dv.metadata.uid}>
                  <Td>
                    <ResourceLink
                      groupVersionKind={{
                        version: 'v1beta1',
                        kind: 'DataVolume',
                        group: 'cdi.kubevirt.io',
                      }}
                      name={dv?.metadata?.name}
                      namespace={dv?.metadata?.namespace}
                    />
                  </Td>
                  <Td>
                    <Status status={dv?.status?.phase}></Status>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {conditions.length > 0 && (
        <>
          <SectionHeading
            text={'Conditions'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <Table aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Type')}</Th>
                <Th>{t('Status')}</Th>
                <Th>{t('Updated')}</Th>
                <Th>{t('Reason')}</Th>
                <Th> {t('Message')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {conditions.map((condition) => (
                <Tr key={condition.type}>
                  <Td>{condition.type}</Td>
                  <Td>{getStatusLabel(condition.status)}</Td>
                  <Td>
                    <ConsoleTimestamp timestamp={condition.lastTransitionTime} />
                  </Td>
                  <Td>{condition.reason}</Td>
                  <Td modifier="truncate">{condition?.message || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      <SectionHeading
        text={'Pipeline'}
        className="forklift-page-plan-details-vm-status__section-header"
      />
      <Table variant="compact">
        <Thead>
          <Tr>
            <Th width={20}>{t('Name')}</Th>
            <Th>{t('Description')}</Th>
            <Th>{t('Tasks')}</Th>
            <Th>{t('Started at')}</Th>
            <Th>{t('Error')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(pipeline || []).map((p) => (
            <Tr key={p?.name}>
              <Td modifier="nowrap">
                <ProgressStepper isCompact isVertical={true} isCenterAligned={false}>
                  <ProgressStep
                    key={p?.name}
                    variant={getVariant(p)}
                    icon={getIcon(p)}
                    id={p?.name}
                    titleId={p?.name}
                  />
                </ProgressStepper>
                {p?.name}
              </Td>
              <Td>{p?.description}</Td>
              <Td>
                {p?.tasks?.length > 0 && (
                  <Tooltip
                    content={t(
                      'Completed {{completed}} of {{total}} {{name}} tasks',
                      getPipelineTasks(p),
                    )}
                  >
                    <Button
                      className="forklift-page-plan-details-vm-tasks"
                      variant="link"
                      onClick={() =>
                        showModal(<PipelineTasksModal name={p?.name} tasks={p.tasks} />)
                      }
                    >
                      <TaskIcon /> {t('{{completed}} / {{total}}', getPipelineTasks(p))}
                    </Button>
                  </Tooltip>
                )}
              </Td>
              <Td>
                <ConsoleTimestamp timestamp={p?.started} />
              </Td>
              <Td>{p?.error?.reasons}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </PageSection>
  );
};

const getJobPhase = (job: IoK8sApiBatchV1Job) => {
  const conditions = job?.status?.conditions || [];

  const conditionFailed = conditions.find((c) => c.type === 'Failed' && c.status === 'True');
  const conditionComplete = conditions.find((c) => c.type === 'Complete' && c.status === 'True');

  if (conditionFailed) {
    return 'Error';
  }

  if (conditionComplete) {
    return 'Complete';
  }

  return 'Pending';
};

const getPipelineTasks = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) => {
  const tasks = pipeline?.tasks || [];

  // search for all completed tasks (either tasks that completed successfully or ones that aren't finished but their pipeline step is).
  const tasksCompleted = tasks.filter((c) => hasTaskCompleted(c.phase, c.progress, pipeline));

  return { total: tasks.length, completed: tasksCompleted.length, name: pipeline.name };
};
