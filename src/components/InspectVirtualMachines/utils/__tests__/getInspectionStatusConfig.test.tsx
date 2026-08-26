import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { t } from '@utils/i18n';

import { getInspectionStatusConfig } from '../getInspectionStatusConfig';

const translate = t as Parameters<typeof getInspectionStatusConfig>[1];

describe('getInspectionStatusConfig', () => {
  it('returns icon and label for each status', () => {
    expect(getInspectionStatusConfig(INSPECTION_STATUS.INSPECTION_PASSED, translate).label).toBe(
      'Inspection passed',
    );
    expect(getInspectionStatusConfig(INSPECTION_STATUS.ISSUES_FOUND, translate).label).toBe(
      'Issues found',
    );
    expect(getInspectionStatusConfig(INSPECTION_STATUS.FAILED, translate).label).toBe(
      'Inspection error',
    );
    expect(getInspectionStatusConfig(INSPECTION_STATUS.RUNNING, translate).label).toBe('Running');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.PENDING, translate).label).toBe('Pending');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.CANCELED, translate).label).toBe('Canceled');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.NOT_INSPECTED, translate).label).toBe(
      'Not inspected',
    );
  });

  it('defaults unknown status to not inspected', () => {
    expect(getInspectionStatusConfig('unknown' as never, translate).label).toBe('Not inspected');
  });
});
