import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { t } from '@utils/i18n';

import { getInspectionStatusConfig } from '../getInspectionStatusConfig';

describe('getInspectionStatusConfig', () => {
  it('returns icon and label for each status', () => {
    expect(getInspectionStatusConfig(INSPECTION_STATUS.INSPECTION_PASSED, t).label).toBe(
      'Inspection passed',
    );
    expect(getInspectionStatusConfig(INSPECTION_STATUS.ISSUES_FOUND, t).label).toBe('Issues found');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.FAILED, t).label).toBe('Inspection error');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.RUNNING, t).label).toBe('Running');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.PENDING, t).label).toBe('Pending');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.CANCELED, t).label).toBe('Canceled');
    expect(getInspectionStatusConfig(INSPECTION_STATUS.NOT_INSPECTED, t).label).toBe(
      'Not inspected',
    );
  });

  it('defaults unknown status to not inspected', () => {
    expect(getInspectionStatusConfig('unknown' as never, t).label).toBe('Not inspected');
  });
});
