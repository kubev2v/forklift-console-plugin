export const POD = 'pod';

// Reference: https://github.com/kubev2v/forklift/blob/3113e867374c560ffbdcd34ef1627cb867893ba5/pkg/controller/plan/validation.go
export enum PlanConditionType {
  VMNetworksNotMapped = 'VMNetworksNotMapped',
  VMStorageNotMapped = 'VMStorageNotMapped',
  VMMultiplePodNetworkMappings = 'VMMultiplePodNetworkMappings',
}
