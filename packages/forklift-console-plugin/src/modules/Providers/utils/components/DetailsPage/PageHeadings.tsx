import React, { ReactNode } from 'react';
import { TFunction } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import {
  K8sGroupVersionKind,
  K8sModel,
  K8sResourceCommon,
  ResourceIcon,
  ResourceStatus,
} from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Breadcrumb, BreadcrumbItem, Split, SplitItem } from '@patternfly/react-core';

import './PageHeadings.style.css';

export const PageHeadings: React.FC<PageHeadingsProps> = ({
  model,
  namespace,
  obj: data,
  children,
  actions,
}) => {
  const status = data?.['status']?.phase;

  return (
    <div className="co-m-nav-title co-m-nav-title--detail forklift-page-headings">
      <BreadCrumbs model={model} namespace={namespace} />
      <span className="co-m-pane__heading">
        <h1 className="co-resource-item__resource-name">
          <Split hasGutter>
            <SplitItem>
              <ResourceIcon
                groupVersionKind={ProviderModelGroupVersionKind}
                className="co-m-resource-icon--lg"
              />{' '}
              {data?.metadata?.name}
              {status && (
                <ResourceStatus additionalClassNames="hidden-xs">
                  <Status status={status} />
                </ResourceStatus>
              )}
            </SplitItem>
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

export interface PageHeadingsProps {
  model: K8sModel;
  namespace?: string;
  obj?: K8sResourceCommon;
  title?: ReactNode;
  actions?: ReactNode;
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ model, namespace }) => {
  const { t } = useForkliftTranslation();

  const breadcrumbs = breadcrumbsForModel(t, model, namespace);

  return (
    <Breadcrumb className="co-breadcrumb">
      {breadcrumbs.map((crumb, i, { length }) => {
        const isLast = i === length - 1;

        return (
          <BreadcrumbItem key={crumb.name} isActive={isLast}>
            {isLast ? (
              crumb.name
            ) : (
              <Link
                className="pf-c-breadcrumb__link"
                to={crumb.path}
                data-test-id={`breadcrumb-link-${i}`}
              >
                {crumb.name}
              </Link>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

type BreadCrumbsProps = {
  model: K8sModel;
  namespace?: string;
};

const breadcrumbsForModel = (t: TFunction, model: K8sModel, namespace: string) => {
  const groupVersionKind: K8sGroupVersionKind = {
    group: model.apiGroup,
    version: model.apiVersion,
    kind: model.kind,
  };

  return [
    {
      name: `${model.labelPlural}`,
      path: `${getResourceUrl({ groupVersionKind, namespace })}`,
    },
    {
      name: t('{{name}} Details', { name: model.label }),
    },
  ];
};
