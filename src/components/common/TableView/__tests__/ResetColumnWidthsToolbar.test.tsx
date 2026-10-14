import { fireEvent, render, screen } from '@testing-library/react';

import ResetColumnWidthsToolbar from '../ResetColumnWidthsToolbar';
import { useTableColumnWidthContext } from '../TableColumnWidthContext';

jest.mock('../TableColumnWidthContext', () => ({ useTableColumnWidthContext: jest.fn() }));
jest.mock('src/utils/i18n', () => ({
  useForkliftTranslation: (): { t: (value: string) => string } => ({ t: (value): string => value }),
}));

const mockContext = jest.mocked(useTableColumnWidthContext);
const resetAllColumnWidths = jest.fn();

const setContext = (enabled: boolean, hasCustomColumnWidths: boolean): void => {
  mockContext.mockReturnValue({
    captureColumnWidths: (): void => undefined,
    columnLayoutKey: 0,
    enabled,
    getResizableProps: (): undefined => undefined,
    hasCustomColumnWidths,
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

  it('keeps Reset available with default widths; the hook owns idempotent resets', () => {
    setContext(true, false);
    render(<ResetColumnWidthsToolbar />);
    const button = screen.getByRole('button', { name: 'Reset column widths' });
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(resetAllColumnWidths).toHaveBeenCalledTimes(1);
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
    expect(button).toBeEnabled();
  });
});
