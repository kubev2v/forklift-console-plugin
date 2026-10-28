import { fireEvent, render, screen } from '@testing-library/react';

import { PLAN_SETTINGS_SECTION_ID } from '../../utils/planSettingsSectionIds';
import PlanSettingsSideNav from '../PlanSettingsSideNav';

jest.mock('@utils/i18n', () => ({
  useForkliftTranslation: (): { t: (value: string) => string } => ({ t: (value): string => value }),
}));

describe('PlanSettingsSideNav', () => {
  it('provides keyboard-focusable category controls that select a section', () => {
    const onSelectSection = jest.fn();
    render(
      <PlanSettingsSideNav
        activeSectionId={PLAN_SETTINGS_SECTION_ID.Guest}
        onSelectSection={onSelectSection}
        visibleSectionIds={[PLAN_SETTINGS_SECTION_ID.Guest, PLAN_SETTINGS_SECTION_ID.Target]}
      />,
    );

    const targetButton = screen.getByRole('button', { name: 'Target VM' });
    targetButton.focus();
    expect(targetButton).toHaveFocus();
    expect(targetButton).toHaveAttribute('type', 'button');

    fireEvent.click(targetButton);
    expect(onSelectSection).toHaveBeenCalledWith(PLAN_SETTINGS_SECTION_ID.Target);
  });
});
