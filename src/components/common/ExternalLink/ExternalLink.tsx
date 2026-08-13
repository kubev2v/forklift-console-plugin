import type { FC, ReactNode } from 'react';

import { Button, type ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { isSafeHttpUrl } from '@utils/validation/common';

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
}) => {
  const safeHref = isSafeHttpUrl(href) ? href : undefined;

  return (
    <Button
      component="a"
      href={safeHref}
      icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
      iconPosition={iconPosition}
      isDisabled={!safeHref}
      isInline={isInline}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
      variant={ButtonVariant.link}
    >
      {text ?? children}{' '}
    </Button>
  );
};
