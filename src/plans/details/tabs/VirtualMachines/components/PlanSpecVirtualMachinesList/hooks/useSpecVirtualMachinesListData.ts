import type { V1beta1Plan } from '@kubev2v/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import { getPlanVirtualMachinesDict } from '../../utils/utils';
import type { SpecVirtualMachinePageData } from '../utils/types';
import { getPlanConditionsDict } from '../utils/utils';

export const useSpecVirtualMachinesListData = (plan: V1beta1Plan) => {
  const virtualMachines = getPlanVirtualMachines(plan);

  const vmDict = getPlanVirtualMachinesDict(plan);
  const conditionsDict = getPlanConditionsDict(plan);

  const specVirtualMachinesListData = virtualMachines.map((specVM, vmIndex) => ({
    conditions: conditionsDict[specVM.id!],
    plan,
    specVM,
    statusVM: vmDict[specVM.id!],
    targetNamespace: plan?.spec?.targetNamespace,
    vmIndex,
  })) as SpecVirtualMachinePageData[];

  return specVirtualMachinesListData;
};
