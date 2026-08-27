import { DateTime } from 'luxon';

import type { V1beta1Migration } from '@forklift-ui/types';

const now = DateTime.utc(2026, 8, 26, 12, 0, 0);

export const makeVm = (
  phase: string,
  conditions: { status?: string; type: string }[] = [],
  times: { completed?: string; started?: string } = {},
): {
  completed?: string;
  conditions: { status?: string; type: string }[];
  phase: string;
  started?: string;
} => ({
  conditions,
  phase,
  ...times,
});

export const makeMigration = (
  name: string,
  vms: ReturnType<typeof makeVm>[],
  started: string,
): V1beta1Migration =>
  ({
    metadata: { name, namespace: 'ns' },
    spec: { plan: { name: `plan-${name}`, namespace: 'ns', uid: `uid-${name}` } },
    status: { started, vms },
  }) as unknown as V1beta1Migration;

export const recentStart = now.minus({ hours: 2 }).toISO() ?? '';
const oldStart = now.minus({ days: 40 }).toISO() ?? '';

export const mixedMigrations: V1beta1Migration[] = [
  makeMigration(
    'mig-ok',
    [
      makeVm('Completed', [{ status: 'True', type: 'Succeeded' }], {
        completed: recentStart,
        started: recentStart,
      }),
      makeVm('Completed', [{ status: 'True', type: 'Failed' }], {
        completed: recentStart,
        started: recentStart,
      }),
    ],
    recentStart,
  ),
  makeMigration(
    'mig-run',
    [
      makeVm('CopyingDisks', [], { started: recentStart }),
      makeVm('Completed', [{ status: 'True', type: 'Canceled' }], {
        completed: recentStart,
        started: recentStart,
      }),
    ],
    recentStart,
  ),
  makeMigration(
    'mig-old',
    [
      makeVm('Completed', [{ status: 'True', type: 'Succeeded' }], {
        completed: oldStart,
        started: oldStart,
      }),
    ],
    oldStart,
  ),
];

export { now };
