import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

type VMsActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabledReason?: string | null;
};

const VMsActionButton: FC<VMsActionButtonProps> = ({ children, disabledReason, onClick }) => {
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

export default VMsActionButton;
