import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen } from '@testing-library/react';

import OffloadPopulatorPriorityClassField from '../OffloadPopulatorPriorityClassField';

mockI18n();

jest.mock('@utils/hooks/usePriorityClasses', () => ({
  usePriorityClasses: (): { loaded: boolean; loadError: null; priorityClasses: string[] } => ({
    loaded: true,
    loadError: null,
    priorityClasses: ['high-priority'],
  }),
}));

describe('OffloadPopulatorPriorityClassField', () => {
  it('renders the label help popover toggle', () => {
    renderWithForm(<OffloadPopulatorPriorityClassField />);

    expect(screen.getByTestId('offload-populator-priority-class-help')).toBeInTheDocument();
  });
});
