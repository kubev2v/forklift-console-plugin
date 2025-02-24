import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DropdownItem } from '@patternfly/react-core';

/**
 * `DropdownItemLink` is a functional component that renders a dropdown item with a link.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.key - The DropdownItem key.
 * @param {string} props.href - The URL to navigate to when the dropdown item is clicked.
 * @param {string} props.description - The description to display below the dropdown item.
 *
 * @returns {React.ReactElement} The rendered JSX element.
 */
export const DropdownItemLink = ({
  key,
  value,
  href,
  description,
  children,
}: DropdownItemLinkProps) => {
  return (
    <DropdownItem key={key} value={value}>
      <Link to={href} className="pf-c-dropdown__menu-item pf-m-description">
        <div className="pf-c-menu__list-item--Displays">{children}</div>
        {description && <div className="pf-c-dropdown__menu-item-description">{description}</div>}
      </Link>
    </DropdownItem>
  );
};

export type DropdownItemLinkProps = {
  key: string;
  value: number;
  href: string;
  description?: string;
  children?: ReactNode;
};
