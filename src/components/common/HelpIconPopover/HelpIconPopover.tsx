import type { FC, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';

import { Button, ButtonVariant, Popover, type PopoverProps } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type HelpIconPopoverProps = {
  children: ReactNode;
  header?: ReactNode;
  popoverProps?: Omit<PopoverProps, 'bodyContent' | 'titleContent'>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export const HelpIconPopover: FC<HelpIconPopoverProps> = ({
  children,
  className,
  header,
  onClick,
  popoverProps,
}) => (
  <Popover position="right" bodyContent={children} headerContent={header} {...popoverProps}>
    <Button
      isInline
      variant={ButtonVariant.plain}
      icon={<HelpIcon />}
      onClick={onClick}
      className={classNames('pf-v6-u-align-items-center', 'pf-v6-u-p-0', className)}
    />
  </Popover>
);
