import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';

import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';

import InspectionStatusLabel from '../InspectionStatusLabel';

describe('InspectionStatusLabel', () => {
  it.each([
    [INSPECTION_STATUS.INSPECTION_PASSED, 'Inspection passed'],
    [INSPECTION_STATUS.ISSUES_FOUND, 'Issues found'],
    [INSPECTION_STATUS.FAILED, 'Inspection error'],
    [INSPECTION_STATUS.RUNNING, 'Running'],
    [INSPECTION_STATUS.PENDING, 'Pending'],
    [INSPECTION_STATUS.CANCELED, 'Canceled'],
    [INSPECTION_STATUS.NOT_INSPECTED, 'Not inspected'],
  ] as const)('renders %s', (status, label) => {
    render(<InspectionStatusLabel status={status} testId="status" />);
    expect(screen.getByTestId('status')).toHaveTextContent(label);
  });
});
