import * as React from 'react';

import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

export const ExternalLink: React.FC<ExternalLinkProps> = ({ children, href, text, isInline }) => (
  <Button
    variant="link"
    icon={<ExternalLinkAltIcon />}
    iconPosition="right"
    component="a"
    href={href}
    target="_blank"
    isInline={isInline}
  >
    {children || text}
  </Button>
);

type ExternalLinkProps = {
  href: string;
  text?: React.ReactNode;
  additionalClassName?: string;
  isInline?: boolean;
};
