import type { V1beta1Migration } from '@forklift-ui/types';

export const getPlanKey = (migration: V1beta1Migration): string => {
  const plan = migration?.spec?.plan;
  return (
    plan?.uid ?? (plan?.namespace && plan?.name ? `${plan.namespace}/${plan.name}` : 'unknown-plan')
  );
};

export const getMigrationStarted = (migration: V1beta1Migration): string =>
  migration?.status?.started ?? migration?.metadata?.creationTimestamp ?? '1970-01-01T00:00:00Z';
