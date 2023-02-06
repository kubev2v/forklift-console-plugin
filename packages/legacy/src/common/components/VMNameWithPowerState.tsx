import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import OffIcon from '@patternfly/react-icons/dist/esm/icons/off-icon';
import UnknownIcon from '@patternfly/react-icons/dist/esm/icons/unknown-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  IRHVVM,
  IVMwareVM,
  SourceInventoryProvider,
  SourceVM,
  IVMStatus,
} from 'legacy/src/queries/types';
import { ProviderType } from 'legacy/src/common/constants';

interface IVMNameWithPowerState {
  sourceProvider: SourceInventoryProvider | null;
  vm?: SourceVM;
  vmStatus?: IVMStatus;
}

export const getVMPowerState = (providerType: ProviderType | undefined, vm?: SourceVM) => {
  let powerStatus: 'on' | 'off' | 'unknown' = 'unknown';
  if (!vm) return powerStatus;
  switch (providerType) {
    case 'ovirt': {
      if ((vm as IRHVVM).status === 'up') powerStatus = 'on';
      if ((vm as IRHVVM).status === 'down') powerStatus = 'off';
      break;
    }
    case 'vsphere': {
      if ((vm as IVMwareVM).powerState === 'poweredOn') powerStatus = 'on';
      if ((vm as IVMwareVM).powerState === 'poweredOff') powerStatus = 'off';
      break;
    }
    default: {
      powerStatus = 'unknown';
    }
  }
  return powerStatus;
};

export const VMNameWithPowerState: React.FunctionComponent<IVMNameWithPowerState> = ({
  sourceProvider,
  vm,
  vmStatus,
}) => {
  const powerState = getVMPowerState(sourceProvider?.type, vm);
  const tooltipText =
    powerState === 'on'
      ? 'Powered on'
      : powerState === 'off'
      ? 'Powered off'
      : 'Unknown power state';

  const powerStateIcon = sourceProvider ? (
    <Tooltip content={tooltipText}>
      {powerState === 'on' ? (
        <SyncAltIcon className={spacing.mrSm} />
      ) : powerState === 'off' ? (
        <OffIcon className={spacing.mrSm} />
      ) : (
        <UnknownIcon className={spacing.mrSm} />
      )}
    </Tooltip>
  ) : null;

  const vmName =
    vm?.name || vmStatus?.name || (vmStatus?.id ? `VM not found (id: ${vmStatus?.id})` : '');

  return (
    <span className="vm-name-with-power-state" aria-label={`${vmName} - ${tooltipText}`}>
      {powerStateIcon}
      <Tooltip content={vmName}>
        <span tabIndex={0}>{vmName}</span>
      </Tooltip>
    </span>
  );
};
