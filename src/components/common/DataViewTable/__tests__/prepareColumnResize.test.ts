import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import { prepareColumnResize } from '../prepareColumnResize';

const createHeaders = (): HTMLTableCellElement[] => {
  const row = document.createElement('tr');
  return [112, 106, 198].map((width) => {
    const header = document.createElement('th');
    header.style.minWidth = '100px';
    jest.spyOn(header, 'getBoundingClientRect').mockImplementation(() => {
      // All reads must precede writes, or later measurements include redistributed space.
      expect(row.firstElementChild?.getAttribute('style')).toBe('min-width: 100px;');
      return { width } as DOMRect;
    });
    row.append(header);
    return header;
  });
};

const createButton = (header: HTMLTableCellElement, label?: string): HTMLButtonElement => {
  const button = document.createElement('button');
  if (label) {
    button.setAttribute('aria-label', label);
  }
  header.append(button);
  return button;
};

describe('prepareColumnResize', () => {
  it.each(['mousedown', 'touchstart', 'keydown'])(
    'rebases minimum widths to rendered widths before %s resizing',
    (type) => {
      const headers = createHeaders();
      const button = createButton(headers[0], 'Name');
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      button.append(icon);
      const event = {
        currentTarget: headers[0],
        ...(type === 'keydown' ? { key: 'ArrowRight' } : {}),
        target: icon,
        type,
      } as unknown as
        | KeyboardEvent<HTMLTableCellElement>
        | MouseEvent<HTMLTableCellElement>
        | TouchEvent<HTMLTableCellElement>;

      prepareColumnResize(event, 'Name');

      expect(headers.map((header) => header.style.minWidth)).toEqual(['112px', '106px', '198px']);
    },
  );

  it('ignores sorting, info buttons and other keyboard events', () => {
    const headers = createHeaders();
    const sortButton = createButton(headers[0]);
    const infoButton = createButton(headers[0], 'More information');
    const resizeButton = createButton(headers[0], 'Name');

    for (const target of [sortButton, infoButton]) {
      prepareColumnResize(
        { currentTarget: headers[0], target } as unknown as MouseEvent<HTMLTableCellElement>,
        'Name',
      );
    }
    prepareColumnResize(
      {
        currentTarget: headers[0],
        key: 'Tab',
        target: resizeButton,
      } as unknown as KeyboardEvent<HTMLTableCellElement>,
      'Name',
    );

    expect(headers.map((header) => header.style.minWidth)).toEqual(['100px', '100px', '100px']);
    for (const header of headers) {
      expect(jest.spyOn(header, 'getBoundingClientRect')).not.toHaveBeenCalled();
    }
  });
});
