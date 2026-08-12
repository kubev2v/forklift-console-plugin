import type { FC, ReactNode } from 'react';

import { Button, type ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  children?: ReactNode;
  hideIcon?: boolean;
  href: string;
  iconPosition?: ButtonProps['iconPosition'];
  isInline?: boolean;
  onClick?: () => void;
  text?: string;
};

export const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  hideIcon = false,
  href,
  iconPosition = 'end',
  isInline = false,
  onClick,
  text = null,
}) => (
  <Button
    component="a"
    href={href}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition={iconPosition}
    isInline={isInline}
    onClick={onClick}
    target="_blank"
    variant={ButtonVariant.link}
  >
    {text ?? children}{' '}
  </Button>
);
