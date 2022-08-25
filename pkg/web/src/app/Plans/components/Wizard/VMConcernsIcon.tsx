import * as React from 'react';
import { SourceVM } from '@app/queries/types';
import { StatusIcon } from '@migtools/lib-ui';

import { getMostSevereVMConcern, getVMConcernStatusLabel, getVMConcernStatusType } from './helpers';
interface IVMConcernsIconProps {
  vm: SourceVM;
}

export const VMConcernsIcon: React.FunctionComponent<IVMConcernsIconProps> = ({
  vm,
}: IVMConcernsIconProps) => {
  if (vm.revisionValidated !== vm.revision) {
    return <StatusIcon status="Loading" label="Analyzing" />;
  }
  const worstConcern = getMostSevereVMConcern(vm);
  const statusType = getVMConcernStatusType(worstConcern);
  const statusLabel = getVMConcernStatusLabel(worstConcern);
  return statusType ? <StatusIcon status={statusType} label={statusLabel} /> : null;
};
