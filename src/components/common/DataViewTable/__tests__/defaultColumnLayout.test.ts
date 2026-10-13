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

  it('reserves natural control widths without competing header widths or a hidden spacer column', () => {
    const { container, name, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);

    expect(getWidths(table)).toEqual(['', '670.5px', '223.5px', '']);
    expect(name.style.width).toBe('');
    expect(name.style.minWidth).toBe('');
    expect(layout.needsRefresh()).toBe(false);
  });

  it('reallocates after viewport changes without retaining a reference-table pixel budget', () => {
    const { container, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);

    expect(layout.needsRefresh()).toBe(true);
    layout.refresh();
    expect(getWidths(table)).toEqual(['', '445.5px', '148.5px', '']);
    expect(layout.needsRefresh()).toBe(false);
  });

  it('refreshes when asynchronous Actions controls change their natural width', () => {
    const { actions, container, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    jest.spyOn(actions, 'getBoundingClientRect').mockReturnValue({ width: 77 } as DOMRect);

    expect(layout.needsRefresh()).toBe(true);
    layout.refresh();
    expect(getWidths(table)).toEqual(['', '658.5px', '219.5px', '']);
  });

  it('stops changing preferences synchronously when resizing begins', () => {
    const { container, table } = createFixture();
    const layout = createDefaultColumnLayout(table, container);
    table.dataset.columnWidthsCustomized = 'true';
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 700 } as DOMRect);
    layout.refresh();

    expect(getWidths(table)).toEqual(['', '670.5px', '223.5px', '']);
    layout.dispose();
    expect(table.querySelector('colgroup')).toBeNull();
  });
});
