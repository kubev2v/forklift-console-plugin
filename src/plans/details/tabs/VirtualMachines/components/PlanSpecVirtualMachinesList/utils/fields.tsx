import { VMConcernsCellRenderer } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMConcernsCellRenderer';

import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const { inventoryVmData, plan, vmIndex } = fieldsData;

  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]: (
      <SpecVirtualMachinesActions plan={plan} vmIndex={vmIndex} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Concerns]: (
      <VMConcernsCellRenderer data={inventoryVmData} fieldId="" fields={[]} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{fieldsData?.specVM?.name}</>,
  };
};
