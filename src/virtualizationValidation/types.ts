import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ValidationOutcome =
  'Cancelled' | 'Error' | 'Failed' | 'Passed' | 'Pending' | 'Running' | 'Skipped' | 'TimedOut';

export type ValidationSeverity = 'Advisory' | 'Required';

export type ValidationReportReduction = {
  totalExecutions?: number;
};

export type VirtualizationValidationStep = {
  extra?: Record<string, string>;
  name: string;
  outcome: ValidationOutcome;
  reason?: string;
};

export type VirtualizationValidationExecution = {
  checkId: string;
  completedAt?: string;
  durationMilliseconds?: number;
  executionId?: string;
  message?: string;
  name: string;
  outcome: ValidationOutcome;
  parameters?: Record<string, string>;
  reason?: string;
  severity: ValidationSeverity;
  startedAt?: string;
  steps?: VirtualizationValidationStep[];
  subject?: {
    kind: string;
    name: string;
    namespace?: string;
  };
};

export type VirtualizationValidationCondition = {
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};

export type VirtualizationValidation = K8sResourceCommon & {
  spec?: {
    run?: {
      cancel?: boolean;
      id?: string;
      profile?: string;
    };
    workload?: {
      namespace?: string;
    };
  };
  status?: {
    artifact?: {
      kind?: string;
      name?: string;
      namespace?: string;
    };
    completedAt?: string;
    conditions?: VirtualizationValidationCondition[];
    executions?: VirtualizationValidationExecution[];
    jobName?: string;
    phase?: 'Cancelled' | 'Completed' | 'Error' | 'Pending' | 'Running';
    reduction?: ValidationReportReduction;
    startedAt?: string;
    summary?: {
      failed?: number;
      passed?: number;
      pending?: number;
      skipped?: number;
      total?: number;
    };
    verdict?: 'Inconclusive' | 'Invalid' | 'Unknown' | 'Valid' | 'ValidWithWarnings';
  };
};
