import { useEffect, useRef } from 'react';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import type { V1beta1Migration, V1beta1Plan } from '@kubev2v/types';
import { MigrationStatus, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getNamespace } from '@utils/crds/common/selectors';

/**
 * Hook that monitors migration status changes and sends analytics events when migrations complete.
 *
 * Watches for migration status transitions and automatically tracks:
 * - MIGRATION_COMPLETED events when all VMs migrate successfully
 * - MIGRATION_FAILED events when any VMs fail to migrate
 *
 * @param plan - The migration plan being monitored
 * @param lastMigration - The most recent migration for this plan (can be undefined)
 */
export const useMigrationAnalytics = (plan: V1beta1Plan, lastMigration?: V1beta1Migration) => {
  const { trackEvent } = useForkliftAnalytics();
  const prevMigrationStatus = useRef<MigrationStatus>();

  useEffect(() => {
    if (!lastMigration?.status) return;

    const isCompleted = Boolean(lastMigration.status.completed);
    const hasStarted = Boolean(lastMigration.status.started);
    const previousStatus = prevMigrationStatus.current;

    let currentStatus = MigrationStatus.Unknown;

    if (isCompleted) {
      currentStatus = MigrationStatus.Completed;
    } else if (hasStarted) {
      currentStatus = MigrationStatus.Started;
    }

    if (
      previousStatus &&
      currentStatus !== previousStatus &&
      currentStatus === MigrationStatus.Completed
    ) {
      const vmCount = lastMigration.status?.vms?.length ?? 0;
      const succeededVms =
        lastMigration.status?.vms?.filter((vm) => vm.completed && !vm.error)?.length ?? 0;
      const failedVms = lastMigration.status?.vms?.filter((vm) => vm.error)?.length ?? 0;

      const baseTrackingData = {
        failedVms,
        migrationType: getPlanMigrationType(plan),
        planName: plan?.metadata?.name,
        planNamespace: getNamespace(plan),
        succeededVms,
        vmCount,
      };

      if (failedVms > 0) {
        trackEvent(TELEMETRY_EVENTS.MIGRATION_FAILED, baseTrackingData);
      } else {
        trackEvent(TELEMETRY_EVENTS.MIGRATION_COMPLETED, baseTrackingData);
      }
    }

    prevMigrationStatus.current = currentStatus;
  }, [trackEvent, plan, lastMigration?.status]);
};
