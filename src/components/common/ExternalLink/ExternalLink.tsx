import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

/**
 * External Links are icon with an optional label/content, but have no background or border. Use
 * for actions that navigate to external pages in a new window. Links may be placed inline
 * with text using the isInline property.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/ExternalLink/ExternalLink.tsx)
 */
export const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  hideIcon = false,
  href,
  isInline = false,
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
  >
    {text ?? children}{' '}
  </Button>
);

type ExternalLinkProps = {
  /**
   * Specifies the URL of the page which the link goes to.
   */
  href: string;

  /**
   * text to be displayed.
   */
  text?: string;

  /**
   * Content rendered inside the button.
   */
  children?: ReactNode;

  /**
   * Adds inline styling to an external link button
   */
  isInline?: boolean;

  /**
   * hide or display the external link icon
   */
  hideIcon?: boolean;
};
