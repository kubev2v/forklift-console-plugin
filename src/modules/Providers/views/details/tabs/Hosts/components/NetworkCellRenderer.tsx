import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, HelperText, HelperTextItem, Popover } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';

import { calculateCidrNotation } from '../utils/helpers/calculateCidrNotation';
import { determineHostStatus } from '../utils/helpers/determineHostStatus';

import type { HostCellProps } from './HostCellProps';

const statusIcons = {
  error: <ExclamationCircleIcon color="#C9190B" />,
  ready: <CheckCircleIcon color="#3E8635" />,
  running: <ExclamationTriangleIcon color="#F0AB00" />,
};

// Define cell renderer for 'network'
export const NetworkCellRenderer: FC<HostCellProps> = (props) => {
  const { t } = useForkliftTranslation();

  const host = props?.data?.host;
  const name = props?.data?.networkAdapter?.name;
  const ip = props?.data?.networkAdapter?.ipAddress;
  const subnetMask = props?.data?.networkAdapter?.subnetMask;

  const cidr = ip && subnetMask ? calculateCidrNotation(ip, subnetMask) : '';

  const hostStatus = determineHostStatus(host);
  const statusIcon = statusIcons[hostStatus.status.toLowerCase()];

  const defaultNetworkLabel = (
    <HelperText>
      <HelperTextItem variant="indeterminate">{t('Default network')}</HelperTextItem>
    </HelperText>
  );

  let cellContent = (
    <>
      {statusIcon} {name ? `${name} - ${cidr}` : defaultNetworkLabel}
    </>
  );

  if (hostStatus.status === 'Running' || hostStatus.status === 'Error') {
    cellContent = (
      <Popover
        showClose={false}
        aria-label="Host status details"
        headerContent={
          <div>
            {statusIcon} {hostStatus.status}
          </div>
        }
        bodyContent={<div>{hostStatus.message}</div>}
      >
        <Button variant="link" isInline data-testid="popover-status-button-host-network">
          {cellContent}
        </Button>
      </Popover>
    );
  }

  return <TableCell>{cellContent}</TableCell>;
};
