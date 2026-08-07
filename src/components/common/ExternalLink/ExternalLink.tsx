import type { FC, ReactNode } from 'react';

import { Button, type ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { isSafeHttpUrl } from '@utils/validation/common';

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
}) => {
  const safeHref = isSafeHttpUrl(href) ? href : undefined;

  return (
    <Button
      variant={ButtonVariant.link}
      icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
      iconPosition={iconPosition}
      component="a"
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      isInline={isInline}
      onClick={onClick}
      isDisabled={!safeHref}
    >
      {text ?? children}{' '}
    </Button>
  );
};
