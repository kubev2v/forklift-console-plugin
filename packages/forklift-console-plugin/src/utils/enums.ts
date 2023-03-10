import { K8sConditionStatus } from '@kubev2v/common/components/types';
import { PlanState, ProviderType } from '@kubev2v/legacy/common/constants';
import { PlanType } from '@kubev2v/legacy/queries/types';

import { ProviderStatus } from './types';

export const PROVIDERS: Record<ProviderType, string> = {
  vsphere: 'VMware',
  ovirt: 'oVirt',
  openstack: 'OpenStack',
  openshift: 'KubeVirt',
};

export const CONDITIONS: Record<K8sConditionStatus, string> = {
  True: 'True',
  False: 'False',
  Unknown: 'Unknown',
};

export const PROVIDER_STATUS: Record<ProviderStatus, string> = {
  Ready: 'Ready',
  ConnectionFailed: 'Connection Failed',
  Staging: 'Staging',
  ValidationFailed: 'Validation Failed',
  Unknown: 'Unknown',
};

export const PLAN_TYPE: Record<PlanType, string> = {
  Warm: 'Warm',
  Cold: 'Cold',
};

// based on filterValue provided by getMigStatusState
export const PLAN_STATUS_FILTER: Record<PlanState, string> = {
  // group: Running
  Starting: 'Running',
  Copying: 'Running',
  'Copying-CutoverScheduled': 'Running',
  PipelineRunning: 'Running',
  // group: Failed
  'Finished-Failed': 'Failed',
  'Copying-Failed': 'Failed',
  // group: Canceled
  Canceled: 'Canceled',
  'Copying-Canceled': 'Canceled',
  // not grouped
  'Finished-Succeeded': 'Succeeded',
  'Finished-Incomplete': 'Finished - Incomplete',
  Archived: 'Archived',
  'NotStarted-NotReady': 'Not Ready',
  'NotStarted-Ready': 'Ready',
  // group: Other - states missing in the original mapping
  StartingCutover: 'Other',
  Archiving: 'Other',
  Unknown: 'Other',
};
