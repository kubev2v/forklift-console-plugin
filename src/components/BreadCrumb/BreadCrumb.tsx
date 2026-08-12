import type { FC } from 'react';
import { Link } from 'react-router';

import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import { breadcrumbsForModel } from './utils';

type BreadCrumbsProps = {
  model: K8sModel;
  namespace?: string;
};

const BreadCrumbs: FC<BreadCrumbsProps> = ({ model, namespace }) => {
  const breadcrumbs = breadcrumbsForModel(model, namespace ?? '');

  return (
    <Breadcrumb className="co-breadcrumb">
      {breadcrumbs.map((crumb, index, { length }) => {
        const isLast = index === length - 1;

        if (isLast) {
          return (
            <BreadcrumbItem data-testid={`breadcrumb-item-${index}`} isActive key={crumb.name}>
              {crumb.name}
            </BreadcrumbItem>
          );
        }

        return (
          <BreadcrumbItem key={crumb.name}>
            <Link
              className="pf-c-breadcrumb__link"
              data-testid={`breadcrumb-link-${index}`}
              to={crumb.path ?? ''}
            >
              {crumb.name}
            </Link>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadCrumbs;
