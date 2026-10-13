import { buildMigrationLogLineEntries } from '../buildMigrationLogLineEntries';

describe('buildMigrationLogLineEntries', () => {
  it('returns empty array for undefined log text', () => {
    expect(buildMigrationLogLineEntries(undefined)).toEqual([]);
  });

  it('assigns unique keys for duplicate lines', () => {
    const entries = buildMigrationLogLineEntries('err\nerr\nok');
    expect(entries).toEqual([
      { key: '0::err', line: 'err' },
      { key: '1::err', line: 'err' },
      { key: '0::ok', line: 'ok' },
    ]);
  });
});
