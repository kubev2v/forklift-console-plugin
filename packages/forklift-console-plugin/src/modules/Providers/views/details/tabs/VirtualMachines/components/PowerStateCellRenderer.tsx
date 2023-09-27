import React from 'react';
import { TableIconCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Tooltip } from '@patternfly/react-core';
import { OffIcon, PowerOffIcon, UnknownIcon } from '@patternfly/react-icons';

import { getVmPowerState } from '../utils';
import { PowerState } from '../utils/helpers/getVmPowerState';

import { VMCellProps } from './VMCellProps';

export const PowerStateCellRenderer: React.FC<VMCellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const powerState = getVmPowerState(data?.vm);
  const states: { [key in PowerState]: [JSX.Element, string, string] } = {
    on: [<PowerOffIcon color="green" key="on" />, t('Powered on'), t('On')],
    off: [<OffIcon color="red" key="off" />, t('Powered off'), t('Off')],
    unknown: [<UnknownIcon key="unknown" />, t('Unknown power state'), t('Unknown')],
  };
  const [icon, tooltipText, shortText] = states[powerState] || states.unknown;

  return (
    <TableIconCell icon={<Tooltip content={tooltipText}>{icon}</Tooltip>}>
      {shortText}
    </TableIconCell>
  );
};
