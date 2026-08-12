import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

type VMsActionButtonProps = {
  children: ReactNode;
  disabledReason?: string | null;
  onClick: () => void;
};

const VMsActionButton: FC<VMsActionButtonProps> = ({ children, disabledReason, onClick }) => {
  const button = (
    <Button
      isAriaDisabled={Boolean(disabledReason)}
      onClick={onClick}
      variant={ButtonVariant.secondary}
    >
      {children}
    </Button>
  );

  return disabledReason ? <Tooltip content={disabledReason}>{button}</Tooltip> : button;
};

export default VMsActionButton;
