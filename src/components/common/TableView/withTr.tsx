import React from 'react';

import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';

import type { RowProps } from './types';

export function withTr<T>(
  Component: React.FC<RowProps<T>>,
  ExpandedComponent?: React.FC<RowProps<T>>,
): React.FC<RowProps<T>> {
  const Enhanced = (props: RowProps<T>) => {
    const { isExpanded, length } = props;

    if (ExpandedComponent) {
      return (
        <>
          <Tr>
            <Component {...props} />
          </Tr>
          <Tr isExpanded={isExpanded}>
            <Td />
            <Td noPadding colSpan={length}>
              {isExpanded && (
                <ExpandableRowContent>
                  <ExpandedComponent {...props} />
                </ExpandableRowContent>
              )}
            </Td>
          </Tr>
        </>
      );
    }

    return (
      <Tr>
        <Component {...props} />
      </Tr>
    );
  };

  return Enhanced;
}
