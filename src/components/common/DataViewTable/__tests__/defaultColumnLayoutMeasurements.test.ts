import { createDefaultColumnLayout } from '../defaultColumnLayout';
import { getControlColumnWidth } from '../defaultColumnLayoutMeasurements';

const getWidths = (table: HTMLTableElement): string[] =>
  Array.from(table.querySelectorAll('col')).map((column) =>
    column.style.getPropertyValue('--forklift-default-column-width'),
  );

describe('empty Actions column measurement', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('keeps empty-table allocations stable and remeasures an Actions button when a row arrives', () => {
    const container = document.createElement('div');
    const table = document.createElement('table');
    const headerRow = table.createTHead().insertRow();
    const dataHeader = document.createElement('th');
    dataHeader.dataset.resizableColumn = 'true';
    dataHeader.dataset.defaultColumnMinWidth = '100';
    dataHeader.dataset.defaultColumnWeight = '1';
    const actionHeader = document.createElement('th');
    actionHeader.id = 'actions';
    actionHeader.dataset.actionColumn = 'true';
    actionHeader.style.paddingInlineStart = '16px';
    actionHeader.style.paddingInlineEnd = '16px';
    const liveHeaderWidth = { current: 90 };
    jest
      .spyOn(actionHeader, 'getBoundingClientRect')
      .mockImplementation(() => ({ width: liveHeaderWidth.current }) as DOMRect);
    jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 500 } as DOMRect);
    headerRow.append(dataHeader, actionHeader);
    const placeholder = table.createTBody().insertRow().insertCell();
    placeholder.colSpan = 2;
    placeholder.textContent = 'No plans found';
    container.append(table);
    document.body.append(container);

    const layout = createDefaultColumnLayout(table, container);
    expect(getControlColumnWidth(actionHeader)).toBe(32);
    expect(getWidths(table)).toEqual(['468px', '32px']);

    for (const headerWidth of [75, 64, 48]) {
      liveHeaderWidth.current = headerWidth;
      expect(layout.needsRefresh()).toBe(false);
      layout.refresh();
      expect(getWidths(table)).toEqual(['468px', '32px']);
    }

    const actionCell = table.tBodies[0].insertRow().insertCell();
    actionCell.dataset.columnId = 'actions';
    actionCell.style.paddingInlineStart = '16px';
    actionCell.style.paddingInlineEnd = '16px';
    const button = document.createElement('button');
    jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({ width: 37 } as DOMRect);
    actionCell.append(button);

    expect(layout.needsRefresh()).toBe(true);
    layout.refresh();
    expect(getWidths(table)).toEqual(['431px', '69px']);
    expect(layout.needsRefresh()).toBe(false);
  });
});
