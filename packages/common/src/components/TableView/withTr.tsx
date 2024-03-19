import React from 'react';

import { ExpandableRowContent, Td, Tr } from '@patternfly/react-table';

import { RowProps } from './types';

export function withTr<T>(
  Component: React.FC<RowProps<T>>,
  ExpandedComponent?: React.FC<RowProps<T>>,
) {
  const Enhanced = (props: RowProps<T>) => {
    const { isExpanded, length } = props;

    if (ExpandedComponent) {
      return (
        <>
          <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            <Component {...props} />
          </Tr>
          <Tr
            isExpanded={isExpanded}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <Td onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
            <Td
              noPadding
              colSpan={length}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
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
      <Tr onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <Component {...props} />
      </Tr>
    );
  };
  Enhanced.displayName = `${Component.displayName || 'Component'}WithTr`;
  return Enhanced;
}
