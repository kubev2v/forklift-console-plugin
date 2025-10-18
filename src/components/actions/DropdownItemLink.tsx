import type { ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DropdownItem } from '@patternfly/react-core';

/**
 * `DropdownItemLink` is a functional component that renders a dropdown item with a link.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.itemKey - The DropdownItem key.
 * @param {string} props.href - The URL to navigate to when the dropdown item is clicked.
 * @param {string} props.description - The description to display below the dropdown item.
 *
 * @returns {ReactElement} The rendered JSX element.
 */
export const DropdownItemLink = ({
  children,
  description,
  href = '#',
  itemKey,
  value,
}: DropdownItemLinkProps) => {
  return (
    <DropdownItem key={itemKey} value={value} to={href} component={Link} description={description}>
      {children}
    </DropdownItem>
  );
};

type DropdownItemLinkProps = {
  itemKey: string;
  value: number;
  href: string;
  description?: string;
  children?: ReactNode;
};
