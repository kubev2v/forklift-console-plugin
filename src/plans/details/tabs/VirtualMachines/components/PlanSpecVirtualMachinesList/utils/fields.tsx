import VirtualMachineConcernsCell from '@components/Concerns/VirtualMachineConcernsCell';
import { EMPTY_MSG } from '@utils/constants';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';
import {
  PlanSpecVirtualMachinesTableResourceId,
  type SpecVirtualMachinePageData,
} from '@utils/types/specVirtualMachinePageData';
import { getVmGuestOS } from '@utils/vm/getVmGuestOS';

import InspectionStatusCell from '../components/InspectionStatusCell';
import { InstanceTypeCellRenderer } from '../components/InstanceType/InstanceTypeCellRenderer';
import SpecVirtualMachinesActions from '../components/SpecVirtualMachinesActions';
import { VMMigrateSharedDisksCellRenderer } from '../components/VMMigrateSharedDisksCellRenderer';
import { VMTargetPowerStateCellRenderer } from '../components/VMTargetPowerStateCellRenderer';

export const getSpecVirtualMachinesRowFields = (fieldsData: SpecVirtualMachinePageData) => {
  const {
    conditions,
    inspectionStatus,
    inventoryVmData,
    plan,
    sourceProviderType,
    specVM,
    vmIndex,
  } = fieldsData;
  return {
    [PlanSpecVirtualMachinesTableResourceId.Actions]: (
      <SpecVirtualMachinesActions plan={plan} vmIndex={vmIndex} providerType={sourceProviderType} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Concerns]: (
      <VirtualMachineConcernsCell vmData={inventoryVmData} conditions={conditions} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.GuestOS]: (
      <>{getVmGuestOS(inventoryVmData?.vm) || EMPTY_MSG}</>
    ),
    [PlanSpecVirtualMachinesTableResourceId.InspectionStatus]: (
      <InspectionStatusCell inspectionStatus={inspectionStatus} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.InstanceType]: (
      <InstanceTypeCellRenderer instanceType={specVM?.instanceType} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.MigrateSharedDisks]: (
      <VMMigrateSharedDisksCellRenderer
        plan={plan}
        migrateSharedDisks={(specVM as EnhancedPlanSpecVms)?.migrateSharedDisks}
      />
    ),
    [PlanSpecVirtualMachinesTableResourceId.Name]: <>{specVM?.name ?? inventoryVmData?.vm?.name}</>,
    [PlanSpecVirtualMachinesTableResourceId.TargetPowerState]: (
      <VMTargetPowerStateCellRenderer plan={plan} targetPowerState={specVM?.targetPowerState} />
    ),
    [PlanSpecVirtualMachinesTableResourceId.VMTargetName]: <>{specVM?.targetName ?? EMPTY_MSG}</>,
  };
};
