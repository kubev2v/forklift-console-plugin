import React from 'react';
import { Link } from 'react-router-dom';
import { useForkliftTranslation } from 'src/utils';

import { Flex, FlexItem, Icon, IconComponentProps, Tooltip } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';

interface PlanStatusVmCountProps {
  count: number;
  linkPath: string;
  status: IconComponentProps['status'] | 'canceled';
  tooltipLabel?: string;
}

export const PlanStatusVmCount: React.FC<PlanStatusVmCountProps> = ({
  count,
  status,
  linkPath,
  tooltipLabel,
}) => {
  const { t } = useForkliftTranslation();

  const statusIcon = React.useMemo(() => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <ExclamationTriangleIcon />;
      case 'danger':
        return <ExclamationCircleIcon />;
      case 'canceled':
        return <MinusCircleIcon color="grey" />;
    }
  }, [status]);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <FlexItem>
        <Tooltip content={tooltipLabel}>
          <Icon {...(status !== 'canceled' && { status })}>{statusIcon}</Icon>
        </Tooltip>
      </FlexItem>

      <FlexItem>
        <Link to={linkPath}>{t('{{total}} VM', { count, total: count })}</Link>
      </FlexItem>
    </Flex>
  );
};
