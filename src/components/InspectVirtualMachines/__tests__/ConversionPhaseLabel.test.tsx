import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { CONVERSION_PHASE } from '@utils/crds/conversion/constants';

import ConversionPhaseLabel from '../ConversionPhaseLabel';

describe('ConversionPhaseLabel', () => {
  it.each([
    [CONVERSION_PHASE.SUCCEEDED, 'Succeeded'],
    [CONVERSION_PHASE.FAILED, 'Failed'],
    [CONVERSION_PHASE.CANCELED, 'Canceled'],
    [CONVERSION_PHASE.RUNNING, 'Running'],
    [CONVERSION_PHASE.PENDING, 'Pending'],
    [undefined, 'Pending'],
  ] as const)('renders %s as %s', (phase, label) => {
    const { unmount } = render(<ConversionPhaseLabel phase={phase} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    unmount();
  });
});
