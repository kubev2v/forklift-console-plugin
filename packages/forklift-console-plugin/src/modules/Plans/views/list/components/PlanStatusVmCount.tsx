import React from 'react';
import { Link } from 'react-router-dom';
import { useForkliftTranslation } from 'src/utils';

import { Flex, FlexItem, Icon, IconComponentProps } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

interface PlanStatusVmCountProps {
  count: number;
  status: IconComponentProps['status'];
  linkPath: string;
}

export const PlanStatusVmCount: React.FC<PlanStatusVmCountProps> = ({
  count,
  status,
  linkPath,
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
    }
  }, [status]);

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
      data-testid={`plan-status-vm-count-${status}`}
    >
      <Icon status={status}>{statusIcon}</Icon>

      <FlexItem>
        <Link to={linkPath}>
          {count > 99 ? t('99+ VMs') : t('{{total}} VM', { count, total: count })}
        </Link>
      </FlexItem>
    </Flex>
  );
};
