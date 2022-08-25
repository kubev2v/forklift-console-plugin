import * as React from 'react';
import { IVMStatus } from '@app/queries/types';
import { StatusIcon, StatusType } from '@migtools/lib-ui';
import { Button, Popover } from '@patternfly/react-core';
import { getMinutesUntil } from '@app/common/helpers';
import { CanceledIcon } from '@app/common/components/CanceledIcon';

interface IWarmVMCopyState {
  state: 'Starting' | 'Copying' | 'Idle' | 'Failed' | 'Warning';
  status: StatusType;
  label: string;
}

export const getWarmVMCopyState = (vmStatus: IVMStatus): IWarmVMCopyState => {
  if (vmStatus.error) {
    return {
      state: 'Failed',
      status: 'Error',
      label: 'Failed',
    };
  }
  if (vmStatus.completed) {
    return {
      state: 'Idle',
      status: 'Ok',
      label: 'Complete',
    };
  }
  if (!vmStatus.warm || (vmStatus.warm.precopies || []).length === 0) {
    return {
      state: 'Starting',
      status: 'Loading',
      label: 'Preparing for incremental copies',
    };
  }
  const { precopies, nextPrecopyAt } = vmStatus.warm;
  if ((precopies || []).some((copy) => !!copy.start && !copy.end)) {
    return {
      state: 'Copying',
      status: 'Loading',
      label: 'Performing incremental data copy',
    };
  }
  if ((precopies || []).every((copy) => !!copy.start && !!copy.end)) {
    return {
      state: 'Idle',
      status: 'Paused',
      label: nextPrecopyAt
        ? `Idle - Next incremental copy will begin in ${getMinutesUntil(nextPrecopyAt)}`
        : 'Idle - Waiting for next incremental copy',
    };
  }
  return {
    state: 'Warning',
    status: 'Warning',
    label: 'Unknown',
  };
};

interface IVMWarmCopyStatusProps {
  vmStatus: IVMStatus;
  isCanceled: boolean;
}

export const VMWarmCopyStatus: React.FunctionComponent<IVMWarmCopyStatusProps> = ({
  vmStatus,
  isCanceled,
}: IVMWarmCopyStatusProps) => {
  if (vmStatus.error) {
    return (
      <Popover hasAutoWidth bodyContent={<>{vmStatus.error.reasons.join('; ')}</>}>
        <Button variant="link" isInline>
          <StatusIcon status="Error" label="Failed" />
        </Button>
      </Popover>
    );
  }
  if (isCanceled) {
    return <CanceledIcon />;
  }
  const { status, label } = getWarmVMCopyState(vmStatus);
  return <StatusIcon status={status} label={label} />;
};
