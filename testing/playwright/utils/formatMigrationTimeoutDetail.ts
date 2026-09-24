import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';

import { isEmpty } from './utils';

type PipelineStep = NonNullable<V1beta1PlanStatusMigrationVms['pipeline']>[number];

export const MIGRATION_TIMEOUT_PREFIX = 'Migration timeout after';
const STATUS_MARKER = 'Status: ';

const isCompletedPhase = (phase: string): boolean => phase.toLowerCase() === 'completed';

const formatReasons = (reasons: string[] | undefined): string => {
  if (reasons === undefined || isEmpty(reasons)) {
    return '';
  }

  return ` error=${reasons.join('; ')}`;
};

const summarizePipelineStep = (step: PipelineStep): string | null => {
  const phase = step.phase ?? '?';
  if (isCompletedPhase(phase)) {
    return null;
  }

  return `${step.name ?? '?'}=${phase}${formatReasons(step.error?.reasons)}`;
};

const summarizeVm = (vm: V1beta1PlanStatusMigrationVms): string => {
  const pipeline = vm.pipeline ?? [];
  const completedCount = pipeline.filter((step) => isCompletedPhase(step.phase ?? '')).length;
  const active = pipeline
    .map((step) => summarizePipelineStep(step))
    .filter((step): step is string => step !== null);

  return `${vm.name ?? '?'} phase=${vm.phase ?? '?'} steps=${completedCount}/${pipeline.length} active=[${active.join(', ') || '-'}]${formatReasons(vm.error?.reasons)}`;
};

export const isMigrationTimeoutError = (error: unknown): error is Error =>
  error instanceof Error && error.message.startsWith(MIGRATION_TIMEOUT_PREFIX);

export const getMigrationTimeoutUiStatus = (message: string): string => {
  const statusIndex = message.lastIndexOf(STATUS_MARKER);
  if (statusIndex === -1) {
    return 'Unknown';
  }

  return message.slice(statusIndex + STATUS_MARKER.length);
};

export const formatMigrationTimeoutDetail = (
  plan: V1beta1Plan | null,
  uiStatus: string,
  timeoutMs: number,
): string => {
  const header = `${MIGRATION_TIMEOUT_PREFIX} ${timeoutMs}ms. Status: ${uiStatus}`;
  if (!plan) {
    return `${header}\nPlan conditions: (unable to fetch plan)`;
  }

  const conditions = (plan.status?.conditions ?? [])
    .filter((condition) => condition.status === 'True')
    .map(
      (condition) =>
        `${condition.type ?? '?'}/${condition.reason ?? ''}: ${condition.message ?? ''}`,
    );
  const conditionText = conditions.join('\n') || '(none)';
  const vms = plan.status?.migration?.vms ?? [];
  const vmText = vms.map((vm) => summarizeVm(vm)).join('\n') || '(no VM pipeline status)';

  return `${header}\nPlan conditions:\n${conditionText}\nPipeline:\n${vmText}`;
};
