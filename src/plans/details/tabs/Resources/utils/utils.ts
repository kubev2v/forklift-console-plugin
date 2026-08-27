import type { OpenshiftVM, OpenstackVM, ProviderVirtualMachine } from '@forklift-ui/types';
import type { EnhancedHypervVM, EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getNutanixPlanResources } from './getNutanixPlanResources';
import { getOpenshiftPlanResources } from './k8sVmResourceHelpers';
import {
  getHypervPlanResources,
  getOpenstackPlanResources,
  getOVAPlanResources,
  getOVirtPlanResources,
  getVSpherePlanResources,
} from './providerPlanResources';
import type {
  EnhancedOVirtVM,
  EnhancedVSphereVM,
  PlanResourcesTableProps,
  VMResources,
} from './types';

export const getPlanResourcesTableProps = (
  planInventory: ProviderVirtualMachine[],
  providerType: string | undefined,
): PlanResourcesTableProps | null => {
  switch (providerType) {
    case PROVIDER_TYPES.ovirt:
      return getOVirtPlanResources(planInventory as EnhancedOVirtVM[]);
    case PROVIDER_TYPES.openshift:
      return getOpenshiftPlanResources(planInventory as OpenshiftVM[]);
    case PROVIDER_TYPES.openstack:
      return getOpenstackPlanResources(planInventory as OpenstackVM[]);
    case PROVIDER_TYPES.vsphere:
      return getVSpherePlanResources(planInventory as EnhancedVSphereVM[]);
    case PROVIDER_TYPES.ova:
      return getOVAPlanResources(planInventory as EnhancedOvaVM[]);
    case PROVIDER_TYPES.hyperv:
      return getHypervPlanResources(planInventory as EnhancedHypervVM[]);
    case PROVIDER_TYPES.nutanix:
      return getNutanixPlanResources(planInventory);
    case PROVIDER_TYPES.ec2:
      return {
        planInventoryRunningSize: planInventory?.length,
        planInventorySize: planInventory?.length,
        totalResources: {} as VMResources,
        totalResourcesRunning: {} as VMResources,
      };
    case undefined:
    default:
      return null;
  }
};
