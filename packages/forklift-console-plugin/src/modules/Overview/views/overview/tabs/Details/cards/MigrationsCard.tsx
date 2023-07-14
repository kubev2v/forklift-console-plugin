import React, { FC, ReactNode } from 'react';
import { MigrationCounts } from 'src/modules/Overview/hooks';

import { V1beta1ForkliftController } from '@kubev2v/types';
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Text,
  TextVariants,
} from '@patternfly/react-core';

type MigrationsCardProps = {
  title: ReactNode;
  obj?: V1beta1ForkliftController;
  count?: MigrationCounts;
  loaded?: boolean;
  loadError?: unknown;
};

interface StatusCardProps {
  status: string;
  count: number | string;
}

/**
 * StatusCard component displays count of given status
 * @param {StatusCardProps} props
 * @returns JSX.Element
 */
const StatusCard: React.FC<StatusCardProps> = ({ status, count }) => (
  <FlexItem>
    <Text component={TextVariants.h1}>{count}</Text>
    <Text>{status}</Text>
  </FlexItem>
);

export const MigrationsCard: FC<MigrationsCardProps> = ({ title, count }) => {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <StatusCard status="Total" count={count['Total']} />
          <StatusCard status="Running" count={count['Running']} />
          <StatusCard status="Failed" count={count['Failed']} />
          <StatusCard status="Succeeded" count={count['Succeeded']} />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default MigrationsCard;
