import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import { VMCellProps } from './VMCellProps';

const statusIcons = {
  Critical: <RedExclamationCircleIcon />,
  Information: <BlueInfoCircleIcon />,
  Warning: <YellowExclamationTriangleIcon />,
};

const categoryWeights = {
  Critical: 1,
  Warning: 2,
  Information: 3,
};

export const VMConcernsCellRenderer: React.FC<VMCellProps> = ({ data }) => {
  return (
    <TableCell>
      <Stack>
        {data?.vm?.concerns
          ?.sort((a, b) => categoryWeights[a.category] - categoryWeights[b.category])
          ?.map((c) => {
            return (
              <StackItem key={c.label}>
                {statusIcons?.[c.category]} {c.label}
              </StackItem>
            );
          })}
      </Stack>
    </TableCell>
  );
};
