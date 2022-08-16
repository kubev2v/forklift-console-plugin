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

export const PlanStatusNavLink: React.FunctionComponent<IPlanStatusNavLinkProps> = ({
  plan,
  isInline = true,
  children,
}: IPlanStatusNavLinkProps) => {
  const history = useHistory();
  return (
    <Button
      variant="link"
      onClick={() => history.push(`${PATH_PREFIX}/plans/${plan.metadata.name}`)}
      isInline={isInline}
      className={!isInline ? 'clickable-progress-bar' : ''}
    >
      {children}
    </Button>
  );
};
