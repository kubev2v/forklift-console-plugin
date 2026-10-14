import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import { prepareColumnResize } from '../prepareColumnResize';

const createHeaders = (): HTMLTableCellElement[] => {
  const row = document.createElement('tr');
  const table = document.createElement('table');
  table.dataset.columnWidthsCustomized = 'false';
  table.append(row);
  return [112, 106, 198].map((width) => {
    const header = document.createElement('th');
    header.style.minWidth = '100px';
    header.setAttribute('data-resizable-column', 'true');
    jest.spyOn(header, 'getBoundingClientRect').mockImplementation(() => {
      // All reads must precede writes, or later measurements include redistributed space.
      expect(row.firstElementChild?.getAttribute('style')).toBe('min-width: 100px;');
      expect(table.dataset.columnWidthsCustomized).toBe('false');
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
  it.each([
    ['mousedown', undefined],
    ['touchstart', undefined],
    ['keydown', 'ArrowRight'],
    ['keydown', 'ArrowLeft'],
  ] as const)('rebases minimum widths to rendered widths before %s resizing', (type, key) => {
    const headers = createHeaders();
    const button = createButton(headers[0], 'Name');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    button.append(icon);
    const event = {
      currentTarget: headers[0],
      ...(key ? { key } : {}),
      target: icon,
      type,
    } as unknown as
      | KeyboardEvent<HTMLTableCellElement>
      | MouseEvent<HTMLTableCellElement>
      | TouchEvent<HTMLTableCellElement>;

    prepareColumnResize(event, 'Name');

    expect(headers.map((header) => header.style.minWidth)).toEqual(['112px', '106px', '198px']);
    expect(headers[0].closest('table')?.dataset.columnWidthsCustomized).toBe('true');
    expect(headers.map((header) => header.dataset.columnWidthFixed)).toEqual([
      'true',
      'true',
      'true',
    ]);
  });

  it('does not freeze the widths of selection or action columns', () => {
    const headers = createHeaders();
    const row = headers[0].parentElement;
    const controls = ['45px', '0px'].map((minWidth) => {
      const header = document.createElement('th');
      header.style.minWidth = minWidth;
      row?.append(header);
      jest.spyOn(header, 'getBoundingClientRect');
      return header;
    });

    prepareColumnResize(
      {
        currentTarget: headers[0],
        target: createButton(headers[0], 'Name'),
      } as unknown as MouseEvent<HTMLTableCellElement>,
      'Name',
    );

    expect(controls.map((header) => header.style.minWidth)).toEqual(['45px', '0px']);
    for (const header of controls) {
      expect(jest.spyOn(header, 'getBoundingClientRect')).not.toHaveBeenCalled();
      expect(header.dataset.columnWidthFixed).toBeUndefined();
    }
  });

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
    expect(headers[0].closest('table')?.dataset.columnWidthsCustomized).toBe('false');
    expect(headers[0].dataset.columnWidthFixed).toBeUndefined();
    for (const header of headers) {
      expect(jest.spyOn(header, 'getBoundingClientRect')).not.toHaveBeenCalled();
    }
  });
});
