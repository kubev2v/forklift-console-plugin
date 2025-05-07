import PlanConditionsField from '../components/PlanConditionsField';
import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';

import { PlanSpecVirtualMachinesTableResourceId, type SpecVirtualMachinePageData } from './types';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const { conditions, plan, vmIndex } = fieldsData;
  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]: (
      <SpecVirtualMachinesActions plan={plan} vmIndex={vmIndex} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Conditions]: (
      <PlanConditionsField conditions={conditions} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{fieldsData?.specVM?.name}</>,
  };
};
