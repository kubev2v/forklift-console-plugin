import { VMConcernsCellRenderer } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMConcernsCellRenderer';

import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';
import { VMTargetPowerStateCellRenderer } from '../components/VMTargetPowerStateCellRenderer';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const { inventoryVmData, plan, specVM, vmIndex } = fieldsData;

  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]:
      inventoryVmData.vm?.providerType === 'vsphere' ? (
        <SpecVirtualMachinesActions plan={plan} vmIndex={vmIndex} />
      ) : null,
    [PlanSpecVirtualMachinesTableResourceId.Concerns]: (
      <VMConcernsCellRenderer data={inventoryVmData} fieldId="" fields={[]} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{specVM?.name}</>,
    [PlanSpecVirtualMachinesTableResourceId.TargetPowerState]: (
      <VMTargetPowerStateCellRenderer plan={plan} targetPowerState={specVM?.targetPowerState} />
    ),
  };
};
