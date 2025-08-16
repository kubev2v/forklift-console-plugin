import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  href: string;
  text?: string;
  children?: ReactNode;
  isInline?: boolean;
  hideIcon?: boolean;
  onClick?: () => void;
};

export const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  hideIcon = false,
  href,
  isInline = false,
  onClick,
  text = null,
}) => (
  <Button
    variant={ButtonVariant.link}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition="right"
    component="a"
    href={href}
    target="_blank"
    isInline={isInline}
    onClick={onClick}
  >
    {text ?? children}{' '}
  </Button>
);
