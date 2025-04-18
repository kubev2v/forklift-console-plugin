import type { FC } from 'react';
import useMigrationCounts from 'src/modules/Overview/hooks/useMigrationCounts';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Text,
  TextVariants,
} from '@patternfly/react-core';

type StatusCardProps = {
  status: string;
  count: number | string;
  counterClassName?: string;
};

/**
 * StatusCard component displays count of given status
 * @param {StatusCardProps} props
 * @returns JSX.Element
 */
const StatusCard: FC<StatusCardProps> = ({ count, counterClassName, status }: StatusCardProps) => (
  <FlexItem>
    <Text component={TextVariants.h1} className={counterClassName}>
      {count}
    </Text>
    <Text component={TextVariants.h6}>{status}</Text>
  </FlexItem>
);

export type MigrationsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

export const MigrationsCard: FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { count, vmCount } = useMigrationCounts();

  return (
    <Card>
      <CardTitle className="forklift-title">{t('Migrations')}</CardTitle>
      <CardBody className="forklift-status-migration">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <StatusCard status="Total" count={count.Total} />
          <StatusCard
            status="Running"
            count={count.Running}
            counterClassName="forklift-status-migration-running"
          />
          <StatusCard
            status="Failed"
            count={count.Failed}
            counterClassName="forklift-status-migration-failed"
          />
          <StatusCard
            status="Succeeded"
            count={count.Succeeded}
            counterClassName="forklift-status-migration-succeeded"
          />
        </Flex>

        <Text component={TextVariants.small}>{t('{{Canceled}} canceled', count)}</Text>
        <Divider />
      </CardBody>

      <CardTitle className="forklift-title">{t('Virtual Machine Migrations')}</CardTitle>
      <CardBody className="forklift-status-migration">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <StatusCard status="Total" count={vmCount.Total} />
          <StatusCard
            status="Running"
            count={vmCount.Running}
            counterClassName="forklift-status-migration-running"
          />
          <StatusCard
            status="Failed"
            count={vmCount.Failed}
            counterClassName="forklift-status-migration-failed"
          />
          <StatusCard
            status="Succeeded"
            count={vmCount.Succeeded}
            counterClassName="forklift-status-migration-succeeded"
          />
        </Flex>

        <Text component={TextVariants.small}>{t('{{Canceled}} canceled', vmCount)}</Text>
        <Divider />
      </CardBody>
    </Card>
  );
};
