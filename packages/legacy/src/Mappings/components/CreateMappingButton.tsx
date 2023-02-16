import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';
import { useHasSufficientProvidersQuery } from 'legacy/src/queries';

interface ICreateMappingButtonProps {
  onClick: () => void;
  variant?: ButtonProps['variant'];
  label?: string;
}

export const CreateMappingButton: React.FunctionComponent<ICreateMappingButtonProps> = ({
  onClick,
  variant = 'primary',
  label = 'Create mapping',
  ...props
}: ICreateMappingButtonProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;
  return (
    <ConditionalTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content={`You must add at least one source and one target provider in order to create a mapping.`}
    >
      <Button
        {...props}
        onClick={onClick}
        isAriaDisabled={!hasSufficientProviders}
        variant={variant}
      >
        {label}
      </Button>
    </ConditionalTooltip>
  );
};
