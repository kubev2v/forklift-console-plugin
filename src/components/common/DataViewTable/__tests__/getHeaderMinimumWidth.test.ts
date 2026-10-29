import { getHeaderMinimumWidth } from '../getHeaderMinimumWidth';

describe('getHeaderMinimumWidth', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('reserves the measured sort and help gaps alongside the title and handle', () => {
    document.body.innerHTML = `
      <table><thead><tr><th style="padding-inline-start: 16px; padding-inline-end: 40px">
        <button style="padding-inline-start: 2px; padding-inline-end: 2px">
          <span data-column-title="true">Long header</span>
          <span id="indicator" style="margin-inline-start: 16px"><svg></svg></span>
        </button>
        <span id="help" style="margin-inline-start: 8px"><button id="help-button"></button></span>
        <span data-column-title-probe="true"></span>
        <button data-resize-handle="true"></button>
      </th></tr></thead></table>
    `;
    const header = document.querySelector('th');
    const probe = document.querySelector('[data-column-title-probe]');
    const indicator = document.querySelector('#indicator');
    const helpButton = document.querySelector('#help-button');
    const handle = document.querySelector('[data-resize-handle]');
    if (!header || !probe || !indicator || !helpButton || !handle) {
      throw new Error('Header control fixture is missing');
    }
    jest.spyOn(probe, 'getBoundingClientRect').mockReturnValue({ width: 32 } as DOMRect);
    jest.spyOn(indicator, 'getBoundingClientRect').mockReturnValue({ width: 16 } as DOMRect);
    jest.spyOn(helpButton, 'getBoundingClientRect').mockReturnValue({ width: 16 } as DOMRect);
    jest.spyOn(handle, 'getBoundingClientRect').mockReturnValue({ width: 32 } as DOMRect);

    expect(getHeaderMinimumWidth(header, 96)).toBe(148);
  });
});
