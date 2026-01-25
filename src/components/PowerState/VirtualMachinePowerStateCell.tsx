import type { FC } from 'react';
import { TableIconCell } from 'src/components/TableCell/TableIconCell';
import {
  getVmPowerState,
  type PowerState,
} from 'src/providers/details/tabs/VirtualMachines/utils/helpers/getVmPowerState';
import type { ProviderVmData } from 'src/utils/types';

import { Tooltip } from '@patternfly/react-core';
import { OffIcon, PowerOffIcon, UnknownIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

const VirtualMachinePowerStateCell: FC<{ vmData: ProviderVmData }> = ({ vmData }) => {
  const { t } = useForkliftTranslation();

  const powerState = getVmPowerState(vmData?.vm);
  const states: Record<PowerState, [JSX.Element, string, string]> = {
    off: [<OffIcon color="grey" key="off" />, t('Powered off'), t('Off')],
    on: [<PowerOffIcon color="green" key="on" />, t('Powered on'), t('On')],
    unknown: [<UnknownIcon key="unknown" />, t('Unknown power state'), t('Unknown')],
  };
  const [icon, tooltipText, shortText] = states[powerState] || states.unknown;

  return (
    <TableIconCell icon={<Tooltip content={tooltipText}>{icon}</Tooltip>}>
      {shortText}
    </TableIconCell>
  );
};

export default VirtualMachinePowerStateCell;
