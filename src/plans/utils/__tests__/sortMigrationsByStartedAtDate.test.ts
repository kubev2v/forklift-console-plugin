import type { V1beta1Migration } from '@forklift-ui/types';

import { sortMigrationsByStartedAtDate } from '../sortMigrationsByStartedAtDate';

const buildMigration = ({
  creationTimestamp,
  name,
  started,
}: {
  creationTimestamp?: string;
  name: string;
  started?: string;
}): V1beta1Migration =>
  ({
    metadata: { creationTimestamp, name },
    status: started === undefined ? {} : { started },
  }) as unknown as V1beta1Migration;

describe('sortMigrationsByStartedAtDate', () => {
  it('sorts by status.started descending', () => {
    const older = buildMigration({ name: 'older', started: '2026-08-05T17:49:00Z' });
    const newer = buildMigration({ name: 'newer', started: '2026-08-05T17:51:00Z' });

    expect(
      sortMigrationsByStartedAtDate([older, newer]).map((migration) => migration.metadata?.name),
    ).toEqual(['newer', 'older']);
  });

  it('falls back to creationTimestamp when started is missing', () => {
    const older = buildMigration({
      creationTimestamp: '2026-08-05T17:49:00Z',
      name: 'older',
    });
    const newer = buildMigration({
      creationTimestamp: '2026-08-05T17:51:00Z',
      name: 'newer',
    });

    expect(
      sortMigrationsByStartedAtDate([older, newer]).map((migration) => migration.metadata?.name),
    ).toEqual(['newer', 'older']);
  });

  it('does not mutate the input array', () => {
    const older = buildMigration({ name: 'older', started: '2026-08-05T17:49:00Z' });
    const newer = buildMigration({ name: 'newer', started: '2026-08-05T17:51:00Z' });
    const input = [older, newer];

    sortMigrationsByStartedAtDate(input);

    expect(input.map((migration) => migration.metadata?.name)).toEqual(['older', 'newer']);
  });
});
