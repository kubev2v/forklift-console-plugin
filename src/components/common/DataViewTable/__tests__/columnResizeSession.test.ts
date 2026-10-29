import {
  activateColumnResize,
  captureColumnResizeSession,
  completeColumnResize,
  previewColumnResize,
  rollbackColumnResize,
} from '../columnResizeSession';

const createTable = (): {
  name: HTMLTableCellElement;
  status: HTMLTableCellElement;
  table: HTMLTableElement;
} => {
  const table = document.createElement('table');
  table.setAttribute('data-column-widths-customized', 'false');
  table.innerHTML = `
    <thead><tr>
      <th id="name" data-resizable-column="true" data-column-width-fixed="false"></th>
      <th id="status" data-resizable-column="true" data-column-width-fixed="false"></th>
      <th data-column-width-spacer="true"></th>
      <th id="actions" data-action-column="true"></th>
    </tr></thead>
  `;
  document.body.append(table);
  const name = table.querySelector<HTMLTableCellElement>('#name');
  const status = table.querySelector<HTMLTableCellElement>('#status');
  if (!name || !status) throw new Error('Resizable headers are missing');
  jest.spyOn(name, 'getBoundingClientRect').mockReturnValue({ width: 160 } as DOMRect);
  jest.spyOn(status, 'getBoundingClientRect').mockReturnValue({ width: 140 } as DOMRect);
  return { name, status, table };
};

afterEach(() => {
  document.body.innerHTML = '';
  jest.restoreAllMocks();
});

describe('column resize session', () => {
  it('freezes all data widths only after activation and commits the complete exact snapshot', () => {
    const { name, status, table } = createTable();
    const session = captureColumnResizeSession(name);
    if (!session) throw new Error('Failed to capture the resize session');
    expect(name.style.minWidth).toBe('');
    expect(table.dataset.columnResizeActive).toBeUndefined();

    activateColumnResize(session);
    expect(name.style.minWidth).toBe('160px');
    expect(status.style.minWidth).toBe('140px');
    expect(table.dataset.columnResizeActive).toBe('true');

    previewColumnResize(session, 187.5);
    expect(completeColumnResize(session, 187.5)).toEqual({ name: 187.5, status: 140 });
    expect(name.style.minWidth).toBe('187.5px');
    expect(status.style.minWidth).toBe('140px');
    expect(status.style.maxWidth).toBe('');
    expect(table.dataset.columnResizeActive).toBeUndefined();
    expect(table.dataset.columnWidthsCustomized).toBe('true');
  });

  it('restores the exact previous DOM state when a gesture is cancelled', () => {
    const { name, status, table } = createTable();
    name.style.minWidth = '115px';
    status.style.maxWidth = '210px';
    const session = captureColumnResizeSession(name);
    if (!session) throw new Error('Failed to capture the resize session');
    activateColumnResize(session);
    previewColumnResize(session, 200);
    rollbackColumnResize(session);

    expect(name.style.minWidth).toBe('115px');
    expect(name.getAttribute('data-column-width-fixed')).toBe('false');
    expect(status.style.maxWidth).toBe('210px');
    expect(table.dataset.columnResizeActive).toBeUndefined();
    expect(table.dataset.columnWidthsCustomized).toBe('false');
  });
});
