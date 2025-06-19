import { DateTime } from 'luxon';
import { getMigrationStarted, getPlanKey } from 'src/overview/utils/utils';

import { FilterDefType } from '@components/common/utils/types';
import type { V1beta1Migration } from '@kubev2v/types';

export const dateRangeObjectMatcher = {
  filterType: FilterDefType.DateRange,
  matchValue: (value: { started?: string; completed?: string }) => (filter: string) => {
    if (!value) return false;
    const [from, to] = filter.split('/');
    const fromDate = DateTime.fromISO(from, { zone: 'utc' }).startOf('day');
    const toDate = DateTime.fromISO(to, { zone: 'utc' }).endOf('day');
    const inRange = (dateStr?: string) => {
      if (!dateStr) return false;
      const date = DateTime.fromISO(dateStr);
      return date >= fromDate && date <= toDate;
    };
    return inRange(value.started) || inRange(value.completed);
  },
};

const mostRecentMigrationFilter = (
  migration: V1beta1Migration,
  migrations: V1beta1Migration[],
): boolean => {
  const planKey = getPlanKey(migration);
  // Find the most recent migration for this plan
  const [mostRecent] = migrations
    .filter((migrationItem) => getPlanKey(migrationItem) === planKey)
    .sort((a, b) => {
      const aStarted = getMigrationStarted(a);
      const bStarted = getMigrationStarted(b);
      return new Date(bStarted).getTime() - new Date(aStarted).getTime();
    });
  return mostRecent?.metadata?.uid === migration.metadata?.uid;
};

export const mostRecentMatcher = (migrations: V1beta1Migration[]) => ({
  filterType: FilterDefType.Slider,
  matchValue: (migration: V1beta1Migration) => (filter: string) => {
    if (filter === 'true') {
      return mostRecentMigrationFilter(migration, migrations);
    }
    return true;
  },
});
