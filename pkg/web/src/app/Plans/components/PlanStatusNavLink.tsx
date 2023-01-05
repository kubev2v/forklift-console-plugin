import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import { IPlan } from '@app/queries/types';
import { PATH_PREFIX } from '@app/common/constants';

interface IPlanStatusNavLinkProps {
  plan: IPlan;
  isInline?: boolean;
  children: React.ReactNode;
}

export const PlanNameNavLink = ({
  name,
  isInline = true,
  children,
}: {
  name: string;
  isInline?: boolean;
  children: React.ReactNode;
}) => {
  const history = useHistory();
  return (
    <Button
      variant="link"
      onClick={() => history.push(`${PATH_PREFIX}/plans/${name}`)}
      isInline={isInline}
      className={!isInline ? 'clickable-progress-bar' : ''}
    >
      {children}
    </Button>
  );
};

export const PlanStatusNavLink: React.FunctionComponent<IPlanStatusNavLinkProps> = ({
  plan,
  isInline = true,
  children,
}: IPlanStatusNavLinkProps) => (
  <PlanNameNavLink name={plan.metadata.name} isInline={isInline}>
    {children}
  </PlanNameNavLink>
);
