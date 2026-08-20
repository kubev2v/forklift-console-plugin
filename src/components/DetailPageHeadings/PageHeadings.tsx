import type { FC, ReactNode } from 'react';

import {
  getGroupVersionKindForResource,
  type K8sGroupVersionKind,
  type K8sModel,
  type K8sResourceKind,
  ResourceIcon,
  ResourceStatus,
} from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Split, SplitItem } from '@patternfly/react-core';

import BreadCrumbs from '../BreadCrumb/BreadCrumb';

import './PageHeadings.scss';

type PageHeadingsProps = {
  actions?: ReactNode;
  children?: ReactNode;
  model: K8sModel;
  namespace?: string;
  obj?: K8sResourceKind;
  status?: string | ReactNode;
  testId?: string;
  title?: ReactNode;
};

export const PageHeadings: FC<PageHeadingsProps> = ({
  actions,
  children,
  model,
  namespace,
  obj: data,
  status,
  testId,
}) => {
  const dataStatus = status ?? (data?.status as { phase?: string } | undefined)?.phase;
  const groupVersionKind = data?.kind && getGroupVersionKindForResource(data);

  return (
    <div className="pf-v6-c-page__main-section">
      <BreadCrumbs model={model} namespace={namespace} />
      <span className="co-m-pane__heading co-resource-item">
        <h1 className="pf-v6-c-content--h1" data-testid={testId}>
          <Split hasGutter>
            <SplitItem>
              <ResourceIcon
                className="co-m-resource-icon--lg"
                groupVersionKind={groupVersionKind as K8sGroupVersionKind}
              />{' '}
              {data?.metadata?.name}
              {typeof dataStatus === 'string' && (
                <span data-testid="resource-status">
                  <ResourceStatus additionalClassNames="hidden-xs">
                    <Status status={dataStatus} />
                  </ResourceStatus>
                </span>
              )}
            </SplitItem>
            {status && typeof status !== 'string' && (
              <SplitItem
                className="forklift-page-headings__status hidden-xs"
                data-testid="plan-status-container"
              >
                {status}
              </SplitItem>
            )}
          </Split>
        </h1>
        <Split hasGutter>
          <SplitItem>{actions}</SplitItem>
        </Split>
      </span>
      {children}
    </div>
  );
};
