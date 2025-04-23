import { PlanConditionType } from './constants';

export const getTroubleshootMessage = (type: PlanConditionType) =>
  [
    PlanConditionType.VMNetworksNotMapped,
    PlanConditionType.VMStorageNotMapped,
    PlanConditionType.VMMultiplePodNetworkMappings,
  ].includes(type);
