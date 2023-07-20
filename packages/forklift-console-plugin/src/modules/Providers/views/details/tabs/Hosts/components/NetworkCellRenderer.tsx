import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover } from '@patternfly/react-core';

import { calculateCidrNotation } from '../utils';
import { determineHostStatus } from '../utils/helpers/determineHostStatus';

import { HostCellProps } from './HostCellProps';

const statusIcons = {
  error: <RedExclamationCircleIcon />,
  ready: <GreenCheckCircleIcon />,
  running: <YellowExclamationTriangleIcon />,
};

// Define cell renderer for 'network'
export const NetworkCellRenderer: React.FC<HostCellProps> = (props) => {
  const host = props?.data?.host;
  const name = props?.data?.networkAdapter?.name;
  const ip = props?.data?.networkAdapter?.ipAddress;
  const subnetMask = props?.data?.networkAdapter?.subnetMask;

  const cidr = ip && subnetMask ? calculateCidrNotation(ip, subnetMask) : '';

  const hostStatus = determineHostStatus(host);
  const statusIcon = statusIcons[hostStatus.status.toLowerCase()];
  let cellContent = (
    <>
      {statusIcon} {name ? `${name} - ${cidr}` : '(default)'}
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
        <Button variant="link" isInline data-test="popover-status-button">
          {cellContent}
        </Button>
      </Popover>
    );
  }

  return <TableCell>{cellContent}</TableCell>;
};
