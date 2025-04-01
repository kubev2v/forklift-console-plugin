import React, { type FC, type ReactNode } from 'react';

import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

export const VMsActionButton: FC<{
  children: ReactNode;
  onClick: () => void;
  disabledReason?: string;
}> = ({ children, disabledReason, onClick }) => {
  const button = (
    <Button
      variant={ButtonVariant.secondary}
      onClick={onClick}
      isAriaDisabled={Boolean(disabledReason)}
    >
      {children}
    </Button>
  );

  return disabledReason ? <Tooltip content={disabledReason}>{button}</Tooltip> : button;
};
