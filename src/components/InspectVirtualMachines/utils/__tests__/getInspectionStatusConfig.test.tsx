import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { PF_LABEL_STATUS } from '@utils/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { t } from '@utils/i18n';

import { getInspectionStatusConfig } from '../getInspectionStatusConfig';

const translate = t as Parameters<typeof getInspectionStatusConfig>[1];

describe('getInspectionStatusConfig', () => {
  it('returns icon, label, and labelStatus for each status', () => {
    const passed = getInspectionStatusConfig(INSPECTION_STATUS.INSPECTION_PASSED, translate);
    expect(passed.label).toBe('Inspection passed');
    expect(passed.labelStatus).toBe(PF_LABEL_STATUS.SUCCESS);
    expect(passed.icon).toBeTruthy();

    const issues = getInspectionStatusConfig(INSPECTION_STATUS.ISSUES_FOUND, translate);
    expect(issues.label).toBe('Issues found');
    expect(issues.labelStatus).toBe(PF_LABEL_STATUS.WARNING);
    expect(issues.icon).toBeTruthy();

    const failed = getInspectionStatusConfig(INSPECTION_STATUS.FAILED, translate);
    expect(failed.label).toBe('Inspection error');
    expect(failed.labelStatus).toBe(PF_LABEL_STATUS.WARNING);
    expect(failed.icon).toBeTruthy();

    const running = getInspectionStatusConfig(INSPECTION_STATUS.RUNNING, translate);
    expect(running.label).toBe('Running');
    expect(running.labelStatus).toBe(PF_LABEL_STATUS.INFO);
    expect(running.icon).toBeTruthy();

    const pending = getInspectionStatusConfig(INSPECTION_STATUS.PENDING, translate);
    expect(pending.label).toBe('Pending');
    expect(pending.labelStatus).toBeUndefined();
    expect(pending.icon).toBeTruthy();

    const canceled = getInspectionStatusConfig(INSPECTION_STATUS.CANCELED, translate);
    expect(canceled.label).toBe('Canceled');
    expect(canceled.icon).toBeTruthy();

    const notInspected = getInspectionStatusConfig(INSPECTION_STATUS.NOT_INSPECTED, translate);
    expect(notInspected.label).toBe('Not inspected');
    expect(notInspected.icon).toBeUndefined();
  });

  it('defaults unknown status to not inspected', () => {
    const unknown = getInspectionStatusConfig('unknown' as never, translate);
    expect(unknown.label).toBe('Not inspected');
    expect(unknown.icon).toBeUndefined();
  });
});
