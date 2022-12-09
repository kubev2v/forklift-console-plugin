import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { ConditionalTooltip } from '@app/common/components/ConditionalTooltip';
import { useHasSufficientProvidersQuery } from '@app/queries';
import { useHistory } from 'react-router-dom';
import { PATH_PREFIX, PROVIDER_TYPE_NAMES } from '@app/common/constants';

interface ICreatePlanButtonProps {
  variant?: ButtonProps['variant'];
}

export const CreatePlanButton: React.FunctionComponent<ICreatePlanButtonProps> = ({
  variant = 'primary',
}: ICreatePlanButtonProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;
  const history = useHistory();
  return (
    <ConditionalTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content={`You must add at least one ${PROVIDER_TYPE_NAMES.vsphere} or ${PROVIDER_TYPE_NAMES.ovirt} provider and one ${PROVIDER_TYPE_NAMES.openshift} provider in order to create a migration plan.`}
    >
      <Button
        onClick={() => history.push(`${PATH_PREFIX}/plans/create`)}
        isAriaDisabled={!hasSufficientProviders}
        variant={variant}
        id="create-plan-button"
      >
        Create plan
      </Button>
    </ConditionalTooltip>
  );
};
