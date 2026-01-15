import type { FC, ReactNode } from 'react';

import { Button, type ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  href: string;
  text?: string;
  children?: ReactNode;
  isInline?: boolean;
  hideIcon?: boolean;
  onClick?: () => void;
  iconPosition?: ButtonProps['iconPosition'];
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
    variant={ButtonVariant.link}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition={iconPosition}
    component="a"
    href={href}
    target="_blank"
    isInline={isInline}
    onClick={onClick}
  >
    {text ?? children}{' '}
  </Button>
);
