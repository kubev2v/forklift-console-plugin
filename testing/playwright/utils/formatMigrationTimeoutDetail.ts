import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';

const WAIT_FOR_GUEST_REBOOTS_NAME = 'WaitForGuestReboots';

type PipelineStep = NonNullable<V1beta1PlanStatusMigrationVms['pipeline']>[number];

export const parsePlanDetailsPath = (href: string): { name: string; namespace: string } | null => {
  let pathname = href;
  try {
    ({ pathname } = new URL(href));
  } catch {
    // Already a path, or not a URL.
  }

  const parts = pathname.split('/').filter(Boolean);
  const planKindIndex = parts.indexOf('forklift.konveyor.io~v1beta1~Plan');
  if (planKindIndex < 2 || parts[planKindIndex - 2] !== 'ns') {
    return null;
  }

  const namespace = parts[planKindIndex - 1];
  const name = parts[planKindIndex + 1];
  if (!namespace || !name) {
    return null;
  }

  return { name, namespace };
};

const isCompletedPhase = (phase: string): boolean => phase.toLowerCase() === 'completed';

const isPendingPhase = (phase: string): boolean => phase.toLowerCase() === 'pending';

const summarizePipelineStep = (step: PipelineStep): string | null => {
  const { name } = step;
  const phase = step.phase ?? '?';
  if (isCompletedPhase(phase)) {
    return null;
  }
  if (isPendingPhase(phase) && name !== WAIT_FOR_GUEST_REBOOTS_NAME) {
    return null;
  }
  return `${name}=${phase}`;
};

const summarizeVm = (vm: V1beta1PlanStatusMigrationVms): string => {
  const pipeline = vm.pipeline ?? [];
  const completedCount = pipeline.filter((step) => isCompletedPhase(step.phase ?? '')).length;
  const active = pipeline
    .map((step) => summarizePipelineStep(step))
    .filter((step): step is string => step !== null);
  const errorReasons = vm.error?.reasons?.join('; ');
  const errorText = errorReasons ? ` error=${errorReasons}` : '';

  return `${vm.name ?? '?'} phase=${vm.phase ?? '?'} steps=${completedCount}/${pipeline.length} active=[${active.join(', ') || '-'}]${errorText}`;
};

export const formatMigrationTimeoutDetail = (
  plan: V1beta1Plan | null,
  uiStatus: string,
  timeoutMs: number,
): string => {
  const header = `Migration timeout after ${timeoutMs}ms. Status: ${uiStatus}`;
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
