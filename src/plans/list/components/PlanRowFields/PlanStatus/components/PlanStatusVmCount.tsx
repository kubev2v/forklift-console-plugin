import { type FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';

import { getVirtualMachineStatusIcon } from '../utils/statusIcon';

import { MIGRATION_STATUSES_ICON_TYPE } from './utils/constants';

type PlanStatusVmCountProps = {
  count: number;
  linkPath: string;
  status: MIGRATION_STATUSES_ICON_TYPE;
  tooltipLabel?: string;
};

const PlanStatusVmCount: FC<PlanStatusVmCountProps> = ({
  count,
  linkPath,
  status,
  tooltipLabel,
}) => {
  const statusIcon = useMemo(() => getVirtualMachineStatusIcon(status), [status]);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
      <FlexItem>
        <Tooltip content={tooltipLabel}>
          <Icon {...(status !== MIGRATION_STATUSES_ICON_TYPE.CANCELED && { status })}>
            {statusIcon}
          </Icon>
        </Tooltip>
      </FlexItem>

      <FlexItem>
        <Link to={linkPath}>{count}</Link>
      </FlexItem>
    </Flex>
  );
};

export default PlanStatusVmCount;
