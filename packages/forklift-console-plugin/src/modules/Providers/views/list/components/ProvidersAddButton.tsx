import React from 'react';

import { Button } from '@patternfly/react-core';

interface AProvidersAddButtonProps {
  onClick: () => void;
  buttonText: string;
  dataTestId?: string;
}

export const ProvidersAddButton: React.FC<AProvidersAddButtonProps> = ({
  onClick,
  buttonText,
  dataTestId,
}) => {
  return (
    <Button data-testid={dataTestId} variant="primary" onClick={onClick}>
      {buttonText}
    </Button>
  );
};

export default ProvidersAddButton;
