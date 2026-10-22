import { MigrationModel, type V1beta1Migration } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';

import {
  CUTOVER_MODE_ASAP,
  CUTOVER_MODE_INHERIT,
  CUTOVER_MODE_SCHEDULED,
  type CutoverMode,
} from '../hooks/useCutoverFormState';
export const formatDateTo12Hours = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeSuffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${timeSuffix}`;
};

export const patchMigrationCutover = async (
  migration: V1beta1Migration,
  cutover?: string,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
): Promise<V1beta1Migration> => {
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

export const getVmCutover = (migration: V1beta1Migration, vmId: string): string | undefined => {
  return migration.spec?.vmCutover?.find((cutover) => cutover.id === vmId)?.cutover;
};

export const getEffectiveVmCutover = (
  migration: V1beta1Migration,
  vmId: string,
): { cutover?: string; isInherited: boolean } => {
  const overrideCutover = getVmCutover(migration, vmId);

  return overrideCutover
    ? { cutover: overrideCutover, isInherited: false }
    : { cutover: migration.spec?.cutover, isInherited: true };
};

/*
Patch a specific virtual machine's cutover time.
if @cutover is not supplied - treat as remove cutover override by 
the vm and revert the cutover to the migration's time
*/
export const patchMigrationVmCutover = async (
  migration: V1beta1Migration,
  vmId: string,
  cutover?: string,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
): Promise<V1beta1Migration> => {
  const current = migration.spec?.vmCutover ?? [];
  const index = current.findIndex((entry) => entry.id === vmId);

  if (!cutover && index === -1) return migration;

  const next = [...current];

  if (!cutover) {
    next.splice(index, 1);
  } else if (index >= 0) {
    next[index] = { ...next[index], cutover };
  } else {
    next.push({ cutover, id: vmId });
  }

  const result = await k8sPatch({
    data: [
      {
        op: 'test',
        path: '/metadata/resourceVersion',
        value: migration.metadata?.resourceVersion,
      },
      {
        op: 'add',
        path: '/spec/vmCutover',
        value: next,
      },
    ],
    model: MigrationModel,
    resource: migration,
  });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_VM_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration.metadata?.name,
    planNamespace: migration.metadata?.namespace,
    vmId,
  });

  return result;
};

export const isCutoverInPast = (cutover: string | undefined): boolean => {
  if (!cutover) return false;
  const cutoverTime = new Date(cutover).getTime();
  if (!Number.isFinite(cutoverTime)) return false;
  return cutoverTime < Date.now();
};

export const getInitialCutoverDate = (existingCutoverValue: string | undefined): string =>
  existingCutoverValue ?? new Date().toISOString();

export const getInitialCutoverMode = (
  hasExistingCutover: boolean,
  existingCutoverValue: string | undefined,
  isInheritAllowed: boolean,
): CutoverMode => {
  if (!hasExistingCutover) return isInheritAllowed ? CUTOVER_MODE_INHERIT : CUTOVER_MODE_ASAP;
  if (!isCutoverInPast(existingCutoverValue)) return CUTOVER_MODE_SCHEDULED;
  return CUTOVER_MODE_ASAP;
};
