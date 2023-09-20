import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { Concern } from '@kubev2v/types';
import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Label, Popover, Stack, StackItem } from '@patternfly/react-core';

import { VMCellProps } from './VMCellProps';

type ConcernCategories = {
  category: 'Critical' | 'Information' | 'Warning';
  label: string;
};

export const VMConcernsCellRenderer: React.FC<VMCellProps> = ({ data }) => {
  const groupedConcerns = groupConcernsByCategory(data?.vm?.concerns);

  return (
    <TableCell>
      <Flex spaceItems={{ default: 'spaceItemsNone' }}>
        {['Critical', 'Information', 'Warning'].map((category) => (
          <FlexItem key={category}>
            <ConcernPopover category={category} concerns={groupedConcerns[category] || []} />
          </FlexItem>
        ))}
      </Flex>
    </TableCell>
  );
};

const groupConcernsByCategory = (concerns: Concern[]): Record<string, ConcernCategories[]> => {
  return (
    concerns?.reduce((acc, concern) => {
      acc[concern.category] = (acc[concern.category] || []).concat(concern);
      return acc;
    }, {}) || {}
  );
};

const ConcernPopover: React.FC<{
  category: string;
  concerns: ConcernCategories[];
}> = ({ category, concerns }) => {
  if (concerns.length < 1) return <></>;

  return (
    <Popover
      aria-label={`${category} popover`}
      headerContent={<div>{category} Concerns</div>}
      bodyContent={<ConcernList concerns={concerns} />}
      footerContent={`Total: ${concerns.length}`}
    >
      <Button variant="link" className="forklift-page-provider-vm_concern-button">
        <ConcernLabel category={category} count={concerns.length} />
      </Button>
    </Popover>
  );
};

const ConcernList: React.FC<{ concerns: ConcernCategories[] }> = ({ concerns }) => (
  <Stack>
    {concerns.map((c) => (
      <StackItem key={c.category}>
        {statusIcons[c.category]} {c.label}
      </StackItem>
    ))}
  </Stack>
);

const ConcernLabel: React.FC<{ category: string; count: number }> = ({ category, count }) => (
  <Label variant="outline" color={categoryColors[category]} icon={statusIcons[category]}>
    {count}
  </Label>
);

const statusIcons = {
  Critical: <RedExclamationCircleIcon />,
  Information: <BlueInfoCircleIcon />,
  Warning: <YellowExclamationTriangleIcon />,
};

const categoryColors = {
  Critical: 'red',
  Information: 'blue',
  Warning: 'orange',
};
