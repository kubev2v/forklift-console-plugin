import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import { IPlan } from 'legacy/src/queries/types';
import { PATH_PREFIX } from 'legacy/src/common/constants';

interface IPlanStatusNavLinkProps {
  plan: IPlan;
  isInline?: boolean;
  children: React.ReactNode;
}

export const PlanNameNavLink = ({
  name,
  namespace,
  isInline = true,
  children,
}: {
  name: string;
  namespace: string;
  isInline?: boolean;
  children: React.ReactNode;
}) => {
  const history = useHistory();
  return (
    <Button
      variant="link"
      onClick={() => history.push(`${PATH_PREFIX}/plans/ns/${namespace}/${name}`)}
      isInline={isInline}
      className={!isInline ? 'forklift-table__status-cell-progress' : ''}
    >
      {children}
    </Button>
  );
};

export const PlanStatusNavLink: React.FunctionComponent<IPlanStatusNavLinkProps> = ({
  plan,
  isInline = true,
  children,
}) => (
  <PlanNameNavLink
    name={plan.metadata.name}
    namespace={plan.metadata.namespace}
    isInline={isInline}
  >
    {children}
  </PlanNameNavLink>
);
