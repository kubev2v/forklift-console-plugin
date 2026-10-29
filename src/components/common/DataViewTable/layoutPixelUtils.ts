const toZoomFactor = (value: string | undefined): number => {
  const parsed = Number.parseFloat(value ?? '');
  const zoom = value?.endsWith('%') ? parsed / 100 : parsed;
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
};

export const getEffectiveCssZoom = (element: Element): number => {
  if (Number.isFinite(element.currentCSSZoom) && element.currentCSSZoom > 0) {
    return element.currentCSSZoom;
  }

  let zoom = 1;
  for (let current: Element | null = element; current; current = current.parentElement) {
    const inlineZoom = current instanceof HTMLElement ? current.style.zoom : undefined;
    zoom *= toZoomFactor(getComputedStyle(current).zoom ?? inlineZoom);
  }
  return zoom;
};

export const getLayoutPixelWidth = (element: Element): number =>
  element.getBoundingClientRect().width / getEffectiveCssZoom(element);
