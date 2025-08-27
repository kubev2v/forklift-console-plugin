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

import BreadCrumbs from './BreadCrumb';

import './PageHeadings.scss';

type PageHeadingsProps = {
  model: K8sModel;
  namespace?: string;
  obj?: K8sResourceKind;
  title?: ReactNode;
  actions?: ReactNode;
  status?: string | ReactNode;
  children?: ReactNode;
};

export const PageHeadings: FC<PageHeadingsProps> = ({
  actions,
  children,
  model,
  namespace,
  obj: data,
  status,
}) => {
  const dataStatus = status ?? data?.status?.phase;
  const groupVersionKind = data?.kind && getGroupVersionKindForResource(data);

  return (
    <div className="pf-v6-c-page__main-section">
      <BreadCrumbs model={model} namespace={namespace} />
      <span className="co-m-pane__heading co-resource-item">
        <h1 className="pf-v6-c-content--h1" data-testid="resource-details-title">
          <Split hasGutter>
            <SplitItem>
              <ResourceIcon
                groupVersionKind={groupVersionKind as K8sGroupVersionKind}
                className="co-m-resource-icon--lg"
              />{' '}
              {data?.metadata?.name}
              {typeof dataStatus === 'string' && (
                <ResourceStatus additionalClassNames="hidden-xs">
                  <Status status={dataStatus} />
                </ResourceStatus>
              )}
            </SplitItem>
            {status && typeof status !== 'string' && (
              <SplitItem className="forklift-page-headings__status hidden-xs">{status}</SplitItem>
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
