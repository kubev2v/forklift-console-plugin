/** Warn when used space reaches this share of capacity (vSphere yellow "usage on disk"). */
export const DATASTORE_HIGH_USAGE_RATIO = 0.75;

type DatastoreWarning =
  { kind: 'highUsage'; usedPercent: number } | { kind: 'inaccessible' } | { kind: 'maintenance' };

type DatastoreWarningFields = {
  accessible?: boolean;
  capacity: number;
  free: number;
  maintenance?: string;
};

/**
 * Advisory reasons a datastore is a poor copyApplianceTemplate target. Empty when the store
 * looks fine. Does not block selection.
 */
export const getDatastoreWarnings = (datastore: DatastoreWarningFields): DatastoreWarning[] => {
  const warnings: DatastoreWarning[] = [];

  // Only warn on an explicit false — older inventory omits the field.
  if (datastore.accessible === false) {
    warnings.push({ kind: 'inaccessible' });
  }

  const maintenance = (datastore.maintenance ?? '').trim().toLowerCase();
  if (maintenance && maintenance !== 'normal') {
    warnings.push({ kind: 'maintenance' });
  }

  const { capacity, free } = datastore;
  if (capacity > 0 && free >= 0 && free / capacity <= 1 - DATASTORE_HIGH_USAGE_RATIO) {
    warnings.push({
      kind: 'highUsage',
      usedPercent: Math.round(((capacity - free) / capacity) * 100),
    });
  }

  return warnings;
};

type Translate = (key: string, params?: Record<string, string | number>) => string;

export const formatDatastoreWarnings = (warnings: DatastoreWarning[], t: Translate): string =>
  warnings
    .map((warning) => {
      switch (warning.kind) {
        case 'inaccessible':
          return t('Inaccessible');
        case 'maintenance':
          return t('In maintenance');
        case 'highUsage':
          return t('Disk usage high ({{usedPercent}}% used)', {
            usedPercent: warning.usedPercent,
          });
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('; ');
