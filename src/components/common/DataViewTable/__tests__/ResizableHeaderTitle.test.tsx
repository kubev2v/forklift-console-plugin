import { act, render, screen, waitFor } from '@testing-library/react';

import ResizableHeaderTitle from '../ResizableHeaderTitle';

describe('ResizableHeaderTitle', () => {
  it('becomes keyboard focusable when late styles clip a formerly fitting title', async () => {
    render(<ResizableHeaderTitle isSortable={false} label="Migration status" />);
    const title = screen.getByText('Migration status');
    expect(title.getAttribute('tabindex')).toBeNull();

    Object.defineProperty(title, 'clientWidth', { configurable: true, value: 80 });
    Object.defineProperty(title, 'scrollWidth', { configurable: true, value: 140 });
    const style = document.createElement('style');
    act(() => {
      style.textContent = '.late-style { font-weight: bold; }';
      document.head.append(style);
    });

    await waitFor(() => {
      expect(title.getAttribute('tabindex')).toBe('0');
    });
    style.remove();
  });
});
