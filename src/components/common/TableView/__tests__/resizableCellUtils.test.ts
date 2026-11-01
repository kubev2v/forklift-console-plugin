import { CLIP_TOLERANCE_PX, measureCellDisclosure } from '../resizableCellUtils';

const createCell = (html: string): HTMLTableCellElement => {
  document.body.innerHTML = `<table><tbody><tr><td id="cell">${html}</td></tr></tbody></table>`;
  const cell = document.querySelector<HTMLTableCellElement>('#cell');
  if (!cell) throw new Error('Cell fixture is missing');
  return cell;
};

const setSize = (element: HTMLElement, clientWidth: number, scrollWidth: number): void => {
  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('measureCellDisclosure', () => {
  it('reports no clipping when the content fits', () => {
    const cell = createCell('<span>Short</span>');
    setSize(cell, 100, 100);

    expect(measureCellDisclosure(cell).clipped).toBe(false);
  });

  it('ignores overflow within the clip tolerance', () => {
    const cell = createCell('<span>Edge</span>');
    cell.style.overflow = 'hidden';
    setSize(cell, 100, 100 + CLIP_TOLERANCE_PX);

    expect(measureCellDisclosure(cell).clipped).toBe(false);
  });

  it('reports clipping when the cell scrolls and hides overflow', () => {
    const cell = createCell('<span>Long virtual machine name</span>');
    cell.style.overflow = 'hidden';
    setSize(cell, 100, 300);

    expect(measureCellDisclosure(cell).clipped).toBe(true);
  });

  it('reports clipping when only a descendant hides its overflow', () => {
    const cell = createCell('<span id="inner">Long virtual machine name</span>');
    setSize(cell, 300, 300);
    const inner = document.querySelector<HTMLSpanElement>('#inner');
    if (!inner) throw new Error('Inner fixture is missing');
    inner.style.overflow = 'hidden';
    setSize(inner, 40, 200);

    expect(measureCellDisclosure(cell).clipped).toBe(true);
  });

  it('ignores overflow that is not hidden', () => {
    const cell = createCell('<span>Long virtual machine name</span>');
    setSize(cell, 100, 300);

    expect(measureCellDisclosure(cell).clipped).toBe(false);
  });

  it('returns the trimmed text content', () => {
    const cell = createCell('<span>  Virtual machine  </span>');

    expect(measureCellDisclosure(cell).text).toBe('Virtual machine');
  });

  it.each([
    { html: '<a href="/vm">Name</a>', interactive: true, name: 'link' },
    { html: '<button type="button">Name</button>', interactive: true, name: 'button' },
    {
      html: '<span contenteditable="true">Name</span>',
      interactive: false,
      name: 'contenteditable without tab stop',
    },
    {
      html: '<span contenteditable="true" tabindex="0">Name</span>',
      interactive: true,
      name: 'contenteditable',
    },
    {
      html: '<button disabled type="button">Name</button>',
      interactive: false,
      name: 'disabled button',
    },
    { html: '<input type="hidden" />', interactive: false, name: 'hidden input' },
    {
      html: '<button tabindex="-1" type="button">Name</button>',
      interactive: false,
      name: 'negative tab index',
    },
    {
      html: '<span aria-hidden="true"><a href="/vm">Name</a></span>',
      interactive: false,
      name: 'aria-hidden ancestor',
    },
    {
      html: '<span style="display: none"><a href="/vm">Name</a></span>',
      interactive: false,
      name: 'display none ancestor',
    },
    {
      html: '<span style="visibility: hidden"><a href="/vm">Name</a></span>',
      interactive: false,
      name: 'visibility hidden ancestor',
    },
  ])('detects interactivity for a $name', ({ html, interactive }) => {
    const cell = createCell(html);

    expect(measureCellDisclosure(cell).interactive).toBe(interactive);
  });
});
