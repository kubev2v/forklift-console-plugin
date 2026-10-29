import { fireEvent, render, screen } from '@testing-library/react';

import ResetColumnWidthsToolbar from '../ResetColumnWidthsToolbar';
import { useTableColumnWidthContext } from '../TableColumnWidthContext';

jest.mock('../TableColumnWidthContext', () => ({ useTableColumnWidthContext: jest.fn() }));
jest.mock('src/utils/i18n', () => ({
  useForkliftTranslation: (): { t: (value: string) => string } => ({ t: (value): string => value }),
}));

const mockContext = jest.mocked(useTableColumnWidthContext);
const resetAllColumnWidths = jest.fn();

const setContext = (enabled: boolean, hasKnownColumnWidths: boolean): void => {
  mockContext.mockReturnValue({
    columnLayoutKey: '[null,0,0]',
    commitColumnWidths: (): void => undefined,
    enabled,
    flushPendingColumnWidths: (): void => undefined,
    getResizeConfig: (): undefined => undefined,
    hasCustomColumnWidths: hasKnownColumnWidths,
    hasKnownColumnWidths,
    resetAllColumnWidths,
  });
};

describe('ResetColumnWidthsToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not show Reset for nonresizable tables', () => {
    setContext(false, false);
    render(<ResetColumnWidthsToolbar />);
    expect(screen.queryByRole('button', { name: 'Reset column widths' })).not.toBeInTheDocument();
  });

  it('shows Reset disabled while widths are at defaults', () => {
    setContext(true, false);
    render(<ResetColumnWidthsToolbar />);
    const button = screen.getByRole('button', { name: 'Reset column widths' });
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(resetAllColumnWidths).not.toHaveBeenCalled();
  });

  it('keeps Reset available after resizing and repeated resets', () => {
    setContext(true, true);
    const { rerender } = render(<ResetColumnWidthsToolbar />);
    const button = screen.getByRole('button', { name: 'Reset column widths' });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(resetAllColumnWidths).toHaveBeenCalledTimes(1);
    setContext(true, false);
    rerender(<ResetColumnWidthsToolbar />);
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
  });
});
