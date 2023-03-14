import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';
import { useHasSufficientProvidersQuery } from 'legacy/src/queries';
import { useHistory } from 'react-router-dom';
import { ENV, PATH_PREFIX } from 'legacy/src/common/constants';

interface ICreatePlanButtonProps {
  variant?: ButtonProps['variant'];
  namespace?: string;
}

export const CreatePlanButton: React.FunctionComponent<ICreatePlanButtonProps> = ({
  variant = 'primary',
  namespace,
}: ICreatePlanButtonProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;
  const history = useHistory();
  return (
    <ConditionalTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content={`You must add at least one source and one target provider in order to create a migration plan.`}
    >
      <Button
        onClick={() =>
          history.push(`${PATH_PREFIX}/plans/ns/${namespace || ENV.DEFAULT_NAMESPACE}/create`)
        }
        isAriaDisabled={!hasSufficientProviders}
        variant={variant}
        id="create-plan-button"
      >
        Create plan
      </Button>
    </ConditionalTooltip>
  );
};
