import type { FC, ReactNode } from 'react';
import { STATUS_ICONS } from 'src/components/status/statusIcons';
import { TableCell } from 'src/components/TableCell/TableCell';
import { calculateCidrNotation } from 'src/providers/details/tabs/Hosts/utils/helpers/calculateCidrNotation';
import { determineHostStatus } from 'src/providers/details/tabs/Hosts/utils/helpers/determineHostStatus';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, HelperText, HelperTextItem, Popover } from '@patternfly/react-core';

import type { HostCellProps } from './utils/types';

const statusIcons: Record<string, ReactNode> = {
  error: STATUS_ICONS.danger,
  ready: STATUS_ICONS.success,
  running: STATUS_ICONS.warning,
};

// Define cell renderer for 'network'
const NetworkCellRenderer: FC<HostCellProps> = (props) => {
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
      <HelperTextItem>{t('Default network')}</HelperTextItem>
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
        <Button
          variant={ButtonVariant.link}
          isInline
          data-testid="popover-status-button-host-network"
        >
          {cellContent}
        </Button>
      </Popover>
    );
  }

  return <TableCell>{cellContent}</TableCell>;
};

export default NetworkCellRenderer;
