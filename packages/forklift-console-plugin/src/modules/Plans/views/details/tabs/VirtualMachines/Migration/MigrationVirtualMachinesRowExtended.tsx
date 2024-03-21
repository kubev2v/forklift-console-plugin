import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { RowProps, TableComposable, Tbody, Td, Th, Thead, Tr } from '@kubev2v/common';
import { IoK8sApiBatchV1Job, V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import {
  ResourcesAlmostFullIcon,
  ResourcesEmptyIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons';

import { VMData } from '../types';

export const MigrationVirtualMachinesRowExtended: React.FC<RowProps<VMData>> = (props) => {
  const { t } = useForkliftTranslation();

  const pipeline = props.resourceData.statusVM?.pipeline;
  const conditions = props.resourceData.statusVM?.conditions;
  const pods = props.resourceData.pods;
  const jobs = props.resourceData.jobs;
  const success = conditions?.find((c) => c.type === 'Succeeded' && c.status === 'True');

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
      {success && (
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

      <SectionHeading
        text={'Pipeline'}
        className="forklift-page-plan-details-vm-status__section-header"
      />
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Name')}</Th>
            <Th>{t('Description')}</Th>
            <Th>{t('Started at')}</Th>
            <Th>{t('Error')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(pipeline || []).map((p) => (
            <Tr key={p?.name}>
              <Td>
                {getIcon(p)} {p?.name}
              </Td>
              <Td>{p?.description}</Td>
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

type GetIconType = (p: V1beta1PlanStatusMigrationVmsPipeline) => React.ReactNode;

const getIcon: GetIconType = (p) => {
  if (p?.error) {
    return <ResourcesAlmostFullIcon color="red" />;
  }

  switch (p?.phase) {
    case 'Completed':
      return <ResourcesFullIcon color="green" />;
    case 'Pending':
      return <ResourcesEmptyIcon color="grey" />;
    case 'Running':
      return <ResourcesAlmostFullIcon color="blue" />;
    default:
      return <ResourcesEmptyIcon color="grey" />;
  }
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
