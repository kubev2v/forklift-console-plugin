import VirtualMachineConcernsCell from '@components/Concerns/VirtualMachineConcernsCell';
import { EMPTY_MSG } from '@utils/constants';

import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';
import { VMTargetPowerStateCellRenderer } from '../components/VMTargetPowerStateCellRenderer';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const { conditions, inventoryVmData, plan, specVM, vmIndex } = fieldsData;
  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]: (
      <SpecVirtualMachinesActions
        plan={plan}
        vmIndex={vmIndex}
        providerType={inventoryVmData?.vm?.providerType}
      />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Concerns]: (
      <VirtualMachineConcernsCell vmData={inventoryVmData} conditions={conditions} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{specVM?.name ?? inventoryVmData?.vm?.name}</>,
    [PlanSpecVirtualMachinesTableResourceId.TargetPowerState]: (
      <VMTargetPowerStateCellRenderer plan={plan} targetPowerState={specVM?.targetPowerState} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.VMTargetName]: <>{specVM?.targetName ?? EMPTY_MSG}</>,
  };
};
