import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
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
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <Icon status={status}>{statusIcon}</Icon>

      <FlexItem>
        <Link to={linkPath}>{t('{{total}} VM', { count, total: count })}</Link>
      </FlexItem>
    </Flex>
  );
};
