import type { V1beta1Migration } from '@forklift-ui/types';
import { getCreatedAt } from '@utils/crds/common/selectors';

/**
 * Sort migrations newest-first by status.started, falling back to creationTimestamp
 * when started is missing (e.g. a Migration that has not been reconciled yet).
 */
export const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]): V1beta1Migration[] =>
  // Copy-then-sort: ES2022 target has no Array.prototype.toSorted (ES2023).
  [...migrations].sort((migrationA, migrationB) => {
    const startedA = migrationA?.status?.started;
    const startedB = migrationB?.status?.started;
    const dateA = new Date(startedA ?? getCreatedAt(migrationA) ?? '');
    const dateB = new Date(startedB ?? getCreatedAt(migrationB) ?? '');
    return dateB.getTime() - dateA.getTime();
  });
