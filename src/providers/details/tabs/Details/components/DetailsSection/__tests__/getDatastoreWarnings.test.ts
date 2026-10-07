import {
  DATASTORE_HIGH_USAGE_RATIO,
  formatDatastoreWarnings,
  getDatastoreWarnings,
} from '../getDatastoreWarnings';

const t = (key: string, params?: Record<string, string | number>): string => {
  if (!params) {
    return key;
  }
  return Object.entries(params).reduce(
    (message, [name, value]) => message.replace(`{{${name}}}`, String(value)),
    key,
  );
};

describe('getDatastoreWarnings', () => {
  it('returns no warnings for a healthy datastore', () => {
    expect(
      getDatastoreWarnings({
        accessible: true,
        capacity: 100,
        free: 50,
        maintenance: 'normal',
      }),
    ).toEqual([]);
  });

  it('ignores omitted accessible (older inventory)', () => {
    expect(
      getDatastoreWarnings({
        capacity: 100,
        free: 50,
        maintenance: '',
      }),
    ).toEqual([]);
  });

  it('warns when inaccessible', () => {
    expect(
      getDatastoreWarnings({
        accessible: false,
        capacity: 100,
        free: 50,
        maintenance: 'normal',
      }),
    ).toEqual([{ kind: 'inaccessible' }]);
  });

  it('warns when in maintenance', () => {
    expect(
      getDatastoreWarnings({
        accessible: true,
        capacity: 100,
        free: 50,
        maintenance: 'inMaintenance',
      }),
    ).toEqual([{ kind: 'maintenance' }]);
  });

  it('warns when disk usage is at or above the high-usage ratio', () => {
    const capacity = 1000;
    const free = capacity * (1 - DATASTORE_HIGH_USAGE_RATIO);
    expect(
      getDatastoreWarnings({
        accessible: true,
        capacity,
        free,
        maintenance: 'normal',
      }),
    ).toEqual([{ kind: 'highUsage', usedPercent: 75 }]);
  });

  it('does not warn just below the high-usage ratio', () => {
    expect(
      getDatastoreWarnings({
        accessible: true,
        capacity: 100,
        free: 26,
        maintenance: 'normal',
      }),
    ).toEqual([]);
  });

  it('combines multiple warnings', () => {
    expect(
      getDatastoreWarnings({
        accessible: false,
        capacity: 100,
        free: 5,
        maintenance: 'enteringMaintenance',
      }),
    ).toEqual([
      { kind: 'inaccessible' },
      { kind: 'maintenance' },
      { kind: 'highUsage', usedPercent: 95 },
    ]);
  });
});

describe('formatDatastoreWarnings', () => {
  it('formats combined warnings for display', () => {
    expect(
      formatDatastoreWarnings(
        [{ kind: 'inaccessible' }, { kind: 'maintenance' }, { kind: 'highUsage', usedPercent: 95 }],
        t,
      ),
    ).toBe('Inaccessible; In maintenance; Disk usage high (95% used)');
  });
});
