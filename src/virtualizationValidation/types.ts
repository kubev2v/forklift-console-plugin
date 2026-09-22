import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ValidationRunKind = 'platform' | 'workload' | 'demo-failure';

export type VirtualizationValidationCheckResult = {
  duration?: number;
  id: string;
  message?: string;
  status: string;
};

export type VirtualizationValidationCondition = {
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};

type VirtualizationValidationResourceRef = {
  kind?: string;
  name?: string;
  namespace?: string;
};

export type VirtualizationValidation = K8sResourceCommon & {
  spec?: {
    checks?: string[];
    profile?: 'Provider';
    providerRef?: {
      name?: string;
      namespace?: string;
    };
    runNonce?: string;
    validationNamespace?: string;
  };
  status?: {
    checkResults?: VirtualizationValidationCheckResult[];
    completedAt?: string;
    conditions?: VirtualizationValidationCondition[];
    jobRef?: VirtualizationValidationResourceRef;
    phase?: 'Pending' | 'Running' | 'Succeeded' | 'Failed';
    resultRef?: VirtualizationValidationResourceRef;
    startedAt?: string;
    summary?: {
      failed?: number;
      passed?: number;
      pending?: number;
      skipped?: number;
      total?: number;
    };
  };
};
