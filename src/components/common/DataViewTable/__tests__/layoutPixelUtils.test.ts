import { getEffectiveCssZoom, getLayoutPixelWidth } from '../layoutPixelUtils';

describe('layout pixel geometry', () => {
  afterEach(() => {
    document.body.replaceChildren();
    jest.restoreAllMocks();
  });

  it('converts visual bounding width into fractional layout pixels', () => {
    const element = document.createElement('th');
    Object.defineProperty(element, 'currentCSSZoom', { configurable: true, value: 1.5 });
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ width: 271.125 } as DOMRect);

    expect(getEffectiveCssZoom(element)).toBe(1.5);
    expect(getLayoutPixelWidth(element)).toBe(180.75);
  });

  it('calculates effective zoom from ancestors when currentCSSZoom is unavailable', () => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const element = document.createElement('th');
    outer.style.zoom = '150%';
    inner.style.zoom = '2';
    inner.append(element);
    outer.append(inner);
    document.body.append(outer);
    Object.defineProperty(element, 'currentCSSZoom', { configurable: true, value: undefined });

    expect(getEffectiveCssZoom(element)).toBe(3);
  });
});
