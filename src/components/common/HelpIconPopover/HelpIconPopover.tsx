import type { FC, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';

import { Button, ButtonVariant, Popover, type PopoverProps } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type HelpIconPopoverProps = {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  popoverProps?: Omit<PopoverProps, 'bodyContent' | 'titleContent'>;
};

export const HelpIconPopover: FC<HelpIconPopoverProps> = ({
  children,
  className,
  header,
  onClick,
  popoverProps,
}) => (
  <Popover bodyContent={children} headerContent={header} position="right" {...popoverProps}>
    <Button
      className={classNames('pf-v6-u-align-items-center', 'pf-v6-u-p-0', className)}
      icon={<HelpIcon />}
      isInline
      onClick={onClick}
      size="sm"
      variant={ButtonVariant.plain}
    />
  </Popover>
);
