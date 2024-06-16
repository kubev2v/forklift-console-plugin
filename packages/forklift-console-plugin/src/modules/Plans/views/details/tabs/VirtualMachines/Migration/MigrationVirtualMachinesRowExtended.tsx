import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { RowProps, TableComposable, Tbody, Td, Th, Thead, Tr } from '@kubev2v/common';
import { IoK8sApiBatchV1Job, V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import {
  Button,
  Flex,
  FlexItem,
  PageSection,
  ProgressStep,
  ProgressStepper,
  Tooltip,
} from '@patternfly/react-core';
import { TaskIcon } from '@patternfly/react-icons';

import { PipelineTasksModal } from '../modals';
import { VMData } from '../types';

import { getIcon, getVariant } from './MigrationVirtualMachinesRow';

export const MigrationVirtualMachinesRowExtended: React.FC<RowProps<VMData>> = (props) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const pipeline = props.resourceData.statusVM?.pipeline;
  const conditions = props.resourceData.statusVM?.conditions;
  const pods = props.resourceData.pods;
  const jobs = props.resourceData.jobs;
  const pvcs = props.resourceData.pvcs;
  const vmCreated = pipeline.find(
    (p) => p?.name === 'VirtualMachineCreation' && p?.phase === 'Completed',
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'True':
        return t('True');
      case 'False':
        return t('False');
      default:
        return status;
    }
  };

  return (
    <PageSection>
      {vmCreated && (
        <>
          <SectionHeading
            text={'Virtual machine'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <TableComposable aria-label="Expandable table" variant="compact">
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
          </TableComposable>
        </>
      )}

      {(pods || []).length > 0 && (
        <>
          <SectionHeading
            text={'Pods'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <TableComposable aria-label="Expandable table" variant="compact">
            <Tbody>
              {(pods || []).map((pod) => (
                <Tr key={pod.metadata.uid}>
                  <Td>
                    <Flex>
                      <FlexItem>
                        <ResourceLink
                          groupVersionKind={{ version: 'v1', kind: 'Pod' }}
                          name={pod?.metadata?.name}
                          namespace={pod?.metadata?.namespace}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Status status={pod?.status?.phase}></Status>
                      </FlexItem>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </>
      )}

      {(jobs || []).length > 0 && (
        <>
          <SectionHeading
            text={'Jobs'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <TableComposable aria-label="Expandable table" variant="compact">
            <Tbody>
              {(jobs || []).map((job) => (
                <Tr key={job.metadata.uid}>
                  <Td>
                    <Flex>
                      <FlexItem>
                        <ResourceLink
                          groupVersionKind={{ group: 'batch', version: 'v1', kind: 'Job' }}
                          name={job?.metadata?.name}
                          namespace={job?.metadata?.namespace}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Status status={getJobPhase(job)}></Status>
                      </FlexItem>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </>
      )}

      {(pvcs || []).length > 0 && (
        <>
          <SectionHeading
            text={'PersistentVolumeClaims'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <TableComposable aria-label="Expandable table" variant="compact">
            <Tbody>
              {(pvcs || []).map((pvc) => (
                <Tr key={pvc.metadata.uid}>
                  <Td>
                    <Flex>
                      <FlexItem>
                        <ResourceLink
                          groupVersionKind={{ version: 'v1', kind: 'PersistentVolumeClaim' }}
                          name={pvc?.metadata?.name}
                          namespace={pvc?.metadata?.namespace}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Status status={pvc.status.phase}></Status>
                      </FlexItem>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </>
      )}

      {(conditions || []).length > 0 && (
        <>
          <SectionHeading
            text={'Conditions'}
            className="forklift-page-plan-details-vm-status__section-header"
          />
          <TableComposable aria-label="Expandable table" variant="compact">
            <Thead>
              <Tr>
                <Th width={10}>{t('Type')}</Th>
                <Th width={10}>{t('Status')}</Th>
                <Th width={20}>{t('Updated')}</Th>
                <Th width={10}>{t('Reason')}</Th>
                <Th> {t('Message')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(conditions || []).map((condition) => (
                <Tr key={condition.type}>
                  <Td>{condition.type}</Td>
                  <Td>{getStatusLabel(condition.status)}</Td>
                  <Td>
                    <Timestamp timestamp={condition.lastTransitionTime} />
                  </Td>
                  <Td>{condition.reason}</Td>
                  <Td modifier="truncate">{condition?.message || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </>
      )}

      <SectionHeading
        text={'Pipeline'}
        className="forklift-page-plan-details-vm-status__section-header"
      />
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Name')}</Th>
            <Th>{t('Description')}</Th>
            <Th>{t('Tasks')}</Th>
            <Th>{t('Started at')}</Th>
            <Th>{t('Error')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(pipeline || []).map((p) => (
            <Tr key={p?.name}>
              <Td>
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
                <Timestamp timestamp={p?.started} />
              </Td>
              <Td>{p?.error?.reasons}</Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
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
  const tasksCompleted = tasks.filter((c) => c.phase === 'Completed');

  return { total: tasks.length, completed: tasksCompleted.length, name: pipeline.name };
};
