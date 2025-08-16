import { VMConcernsCellRenderer } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMConcernsCellRenderer';

import { EMPTY_MSG } from '@utils/constants';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const { inventoryVmData, plan, vmIndex } = fieldsData;

  const vm = getPlanVirtualMachines(plan)[vmIndex];

  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]: (
      <SpecVirtualMachinesActions
        plan={plan}
        vmIndex={vmIndex}
        providerType={inventoryVmData?.vm?.providerType}
      />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Concerns]: (
      <VMConcernsCellRenderer data={inventoryVmData} fieldId="" fields={[]} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{fieldsData?.specVM?.name}</>,
    [PlanSpecVirtualMachinesTableResourceId.VMTargetName]: <>{vm?.targetName ?? EMPTY_MSG}</>,
  };
};
