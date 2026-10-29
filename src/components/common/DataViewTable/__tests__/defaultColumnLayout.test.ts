import { createDefaultColumnLayout } from '../defaultColumnLayout';

type LayoutFixture = {
  actions: HTMLTableCellElement;
  container: HTMLDivElement;
  count: HTMLTableCellElement;
  name: HTMLTableCellElement;
  table: HTMLTableElement;
};

const createFixture = (): LayoutFixture => {
  const container = document.createElement('div');
  const table = document.createElement('table');
  table.dataset.columnWidthsCustomized = 'false';
  const row = table.createTHead().insertRow();
  const headers = [45, 100, 50, 0, 61].map((width) => {
    const header = document.createElement('th');
    header.style.paddingInlineStart = '16px';
    header.style.paddingInlineEnd = '28px';
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
    row.append(header);
    return header;
  });
  const [, name, count, spacer, actions] = headers;
  for (const header of [name, count]) {
    header.dataset.resizableColumn = 'true';
    header.dataset.columnWidthFixed = 'false';
  }
  name.dataset.defaultColumnWeight = '3';
  name.dataset.defaultColumnMinWidth = '100';
  count.dataset.defaultColumnWeight = '1';
  count.dataset.defaultColumnMinWidth = '50';
  spacer.dataset.columnWidthSpacer = 'true';
  container.append(table);
  document.body.append(container);
  jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 1000 } as DOMRect);
  return { actions, container, count, name, table };
};

const getWidths = (table: HTMLTableElement): string[] =>
  Array.from(table.querySelectorAll('col')).map((column) =>
    column.style.getPropertyValue('--forklift-default-column-width'),
  );

describe('defaultColumnLayout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('reserves controls and enforces unsaved data allocations without a hidden spacer column', () => {
    const { container, name, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);

    expect(getWidths(table)).toEqual(['45px', '670.5px', '223.5px', '61px']);
    expect(name.style.width).toBe('');
    expect(name.style.minWidth).toBe('670.5px');
    expect(layout.needsRefresh()).toBe(false);
  });

  it('reallocates after viewport changes without retaining a reference-table pixel budget', () => {
    const { container, name, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);

    expect(layout.needsRefresh()).toBe(true);
    layout.refresh();
    expect(getWidths(table)).toEqual(['45px', '445.5px', '148.5px', '61px']);
    expect(name.style.minWidth).toBe('445.5px');
    expect(layout.needsRefresh()).toBe(false);
  });

  it('allocates CSS pixel widths under CSS zoom', () => {
    const { container, name, table } = createFixture();
    const headers = Array.from(table.tHead?.rows[0].cells ?? []);
    for (const element of [container, ...headers]) {
      Object.defineProperty(element, 'currentCSSZoom', { value: 1.5 });
    }
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 1500 } as DOMRect);
    jest.spyOn(headers[0], 'getBoundingClientRect').mockReturnValue({ width: 67.5 } as DOMRect);
    jest.spyOn(headers[4], 'getBoundingClientRect').mockReturnValue({ width: 91.5 } as DOMRect);

    createDefaultColumnLayout(table, container);

    expect(getWidths(table)).toEqual(['45px', '670.5px', '223.5px', '61px']);
    expect(name.style.minWidth).toBe('670.5px');
  });

  it('keeps unsaved columns readable and overflows a narrow container', () => {
    const { container, count, name, table } = createFixture();
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 250 } as DOMRect);
    createDefaultColumnLayout(table, container);

    const widths = getWidths(table);
    expect(widths[1]).toBe('100px');
    expect(widths[2]).toBe('96px');
    expect(name.style.minWidth).toBe('100px');
    expect(count.style.minWidth).toBe('96px');
    expect(widths.reduce((sum, value) => sum + Number.parseFloat(value), 0)).toBeGreaterThan(250);
  });

  it('reserves fixed saved widths before allocating unsaved columns', () => {
    const { container, name, table } = createFixture();
    table.dataset.columnWidthsCustomized = 'true';
    name.dataset.columnWidthFixed = 'true';
    name.style.minWidth = '600px';
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    const layout = createDefaultColumnLayout(table, container);

    expect(getWidths(table)).toEqual(['45px', '', '96px', '', '61px']);
    expect(table.querySelectorAll('col').length).toBe(table.tHead?.rows[0].cells.length);
    expect(name.style.minWidth).toBe('600px');
    expect(table.tHead?.rows[0].cells[2].style.minWidth).toBe('96px');
    expect(layout.needsRefresh()).toBe(false);
  });

  it('keeps a narrow saved width exact while giving a newly visible column the remaining space', () => {
    const { container, name, table } = createFixture();
    table.dataset.columnWidthsCustomized = 'true';
    name.dataset.columnWidthFixed = 'true';
    name.style.minWidth = '79.125px';
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);

    createDefaultColumnLayout(table, container);

    expect(getWidths(table)).toEqual(['45px', '', '514.875px', '', '61px']);
    expect(name.style.minWidth).toBe('79.125px');
    expect(table.tHead?.rows[0].cells[2].style.minWidth).toBe('514.875px');
  });

  it('refreshes when asynchronous Actions controls change their natural width', () => {
    const { actions, container, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    jest.spyOn(actions, 'getBoundingClientRect').mockReturnValue({ width: 77 } as DOMRect);

    expect(layout.needsRefresh()).toBe(true);
    layout.refresh();
    expect(getWidths(table)).toEqual(['45px', '658.5px', '219.5px', '77px']);
  });

  it('stops changing preferences synchronously when resizing begins', () => {
    const { container, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    table.dataset.columnResizeActive = 'true';
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    layout.refresh();

    expect(getWidths(table)).toEqual(['45px', '670.5px', '223.5px', '61px']);
    layout.dispose();
    expect(table.querySelector('colgroup')).toBeNull();
  });
});
