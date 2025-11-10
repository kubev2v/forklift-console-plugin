import { DateTime } from 'luxon';
import { getMigrationStarted, getPlanKey } from 'src/overview/utils/utils';

import type { ValueMatcher } from '@components/common/FilterGroup/types';
import { FilterDefType } from '@components/common/utils/types';
import type { V1beta1Migration } from '@kubev2v/types';

export const dateRangeObjectMatcher: ValueMatcher = {
  filterType: FilterDefType.DateRange,
  matchValue: (value: unknown) => (filter: string) => {
    if (!value || typeof value !== 'object') return false;
    const obj = value as { started?: string; completed?: string };
    const [from, to] = filter.split('/');
    const fromDate = DateTime.fromISO(from);
    const toDate = DateTime.fromISO(to);
    const inRange = (dateStr?: string) => {
      if (!dateStr) return false;
      const date = DateTime.fromISO(dateStr);
      return date >= fromDate && date <= toDate;
    };
    return inRange(obj.started);
  },
};

export const filterMostRecentMigrations = (migrations: V1beta1Migration[]): V1beta1Migration[] => {
  const latestByPlan = new Map<string, V1beta1Migration>();
  for (const migration of migrations) {
    const planKey = getPlanKey(migration);
    const started = getMigrationStarted(migration);
    const current = latestByPlan.get(planKey);
    if (
      !current ||
      new Date(started).getTime() > new Date(getMigrationStarted(current)).getTime()
    ) {
      latestByPlan.set(planKey, migration);
    }
  }
  return Array.from(latestByPlan.values());
};
