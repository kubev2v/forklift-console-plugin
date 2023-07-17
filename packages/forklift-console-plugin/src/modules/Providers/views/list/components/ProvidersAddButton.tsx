import React from 'react';

import { Button } from '@patternfly/react-core';

interface AProvidersAddButtonProps {
  onClick: () => void;
  buttonText: string;
}

export const ProvidersAddButton: React.FC<AProvidersAddButtonProps> = ({ onClick, buttonText }) => {
  return (
    <Button data-testid="add-provider-button" variant="primary" onClick={onClick}>
      {buttonText}
    </Button>
  );
};

export default ProvidersAddButton;
