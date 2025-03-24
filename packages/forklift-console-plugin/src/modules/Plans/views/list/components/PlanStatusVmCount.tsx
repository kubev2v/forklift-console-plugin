import React from 'react';
import { Link } from 'react-router-dom';
import { useForkliftTranslation } from 'src/utils';

import {
  Flex,
  FlexItem,
  Icon,
  IconComponentProps,
  Popover,
  PopoverProps,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
  PauseCircleIcon,
} from '@patternfly/react-icons';
import { global_warning_color_100 } from '@patternfly/react-tokens';

interface PlanStatusVmCountProps {
  count: number;
  linkPath: string;
  status: IconComponentProps['status'] | 'canceled' | 'paused' | 'running';
  tooltipLabel?: string;
  popoverProps?: PopoverProps;
}

export const PlanStatusVmCount: React.FC<PlanStatusVmCountProps> = ({
  count,
  status,
  linkPath,
  tooltipLabel,
  popoverProps,
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
      case 'paused':
        return <PauseCircleIcon color={global_warning_color_100.value} />;
      case 'running':
        return <Spinner size="sm" />;
    }
  }, [status]);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <FlexItem>
        {popoverProps ? (
          <Popover {...popoverProps}>
            <Icon
              {...(status !== 'canceled' &&
                status !== 'paused' &&
                status !== 'running' && { status })}
            >
              {statusIcon}
            </Icon>
          </Popover>
        ) : (
          <Tooltip content={tooltipLabel}>
            <Icon
              {...(status !== 'canceled' &&
                status !== 'paused' &&
                status !== 'running' && { status })}
            >
              {statusIcon}
            </Icon>
          </Tooltip>
        )}
      </FlexItem>

      <FlexItem>
        <Link to={linkPath}>{t('{{total}} VM', { count, total: count })}</Link>
      </FlexItem>
    </Flex>
  );
};
