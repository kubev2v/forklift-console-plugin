import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';

import InspectionPassedLabel from '../InspectionPassedLabel';

describe('InspectionPassedLabel', () => {
  it('renders passed label', () => {
    render(<InspectionPassedLabel passed />);
    expect(screen.getByText('Inspection passed')).toBeInTheDocument();
  });

  it('renders issues found label', () => {
    render(<InspectionPassedLabel passed={false} />);
    expect(screen.getByText('Issues found')).toBeInTheDocument();
  });
});
