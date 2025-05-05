import type { FC, MouseEventHandler, ReactNode } from 'react';

import { Popover, type PopoverProps } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type HelpIconPopoverProps = {
  children: ReactNode;
  header?: string;
  popoverProps?: Omit<PopoverProps, 'bodyContent' | 'titleContent'>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export const HelpIconPopover: FC<HelpIconPopoverProps> = ({
  children,
  className = `pf-c-form__group-label-help pf-v5-u-ml-sm`,
  header,
  onClick,
  popoverProps,
}) => (
  <Popover position="right" bodyContent={children} headerContent={header} {...popoverProps}>
    <button type="button" className={className} onClick={onClick}>
      <HelpIcon />
    </button>
  </Popover>
);
