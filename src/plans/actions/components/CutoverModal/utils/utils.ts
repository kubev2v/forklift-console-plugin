import { MigrationModel, type V1beta1Migration } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';

export const formatDateTo12Hours = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeSuffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${timeSuffix}`;
};

export const patchMigrationCutover = async (
  migration: V1beta1Migration,
  cutover: string | undefined = undefined,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
) => {
  const op = migration?.spec?.cutover ? 'replace' : 'add';

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/cutover',
        value: cutover,
      },
    ],
    model: MigrationModel,
    resource: migration,
  });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration?.metadata?.name,
    planNamespace: migration?.metadata?.namespace,
  });

  return result;
};
