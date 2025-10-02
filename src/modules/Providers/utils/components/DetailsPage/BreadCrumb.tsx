import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import { breadcrumbsForModel } from './utils/utils';

type BreadCrumbsProps = {
  model: K8sModel;
  namespace?: string;
};

const BreadCrumbs: FC<BreadCrumbsProps> = ({ model, namespace }) => {
  const breadcrumbs = breadcrumbsForModel(model, namespace!);

  return (
    <Breadcrumb className="co-breadcrumb">
      {breadcrumbs.map((crumb, index, { length }) => {
        const isLast = index === length - 1;

        if (isLast) {
          return (
            <BreadcrumbItem key={crumb.name} isActive data-testid={`breadcrumb-item-${index}`}>
              {crumb.name}
            </BreadcrumbItem>
          );
        }

        return (
          <BreadcrumbItem key={crumb.name}>
            <Link
              className="pf-c-breadcrumb__link"
              to={crumb.path!}
              data-testid={`breadcrumb-link-${index}`}
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
