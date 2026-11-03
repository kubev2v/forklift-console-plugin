// cspell:ignore loadingdone
type LayoutListener = () => void;

const listeners = new Set<LayoutListener>();
const observedElements = new Map<Element, number>();
let fontSet: FontFaceSet | undefined;
let headObserver: MutationObserver | undefined;
let elementObserver: ResizeObserver | undefined;

const notifyListeners = (): void => {
  for (const listener of listeners) listener();
};

const isStylesheetNode = (node: Node): boolean =>
  node instanceof HTMLStyleElement ||
  (node instanceof HTMLLinkElement && node.relList.contains('stylesheet')) ||
  node.parentElement instanceof HTMLStyleElement;

const onHeadMutation = (records: MutationRecord[]): void => {
  if (
    records.some(
      (record) =>
        isStylesheetNode(record.target) ||
        Array.from(record.addedNodes).some(isStylesheetNode) ||
        Array.from(record.removedNodes).some(isStylesheetNode),
    )
  ) {
    notifyListeners();
  }
};

const onDocumentLoad = (event: Event): void => {
  if (event.target instanceof HTMLLinkElement && event.target.relList.contains('stylesheet')) {
    notifyListeners();
  }
};

const releaseElementObserver = (): void => {
  elementObserver?.disconnect();
  elementObserver = undefined;
  observedElements.clear();
};

const observeElement = (element: Element): void => {
  if (!elementObserver && typeof ResizeObserver !== 'undefined') {
    elementObserver = new ResizeObserver(notifyListeners);
  }
  const count = observedElements.get(element) ?? 0;
  if (count === 0) elementObserver?.observe(element);
  observedElements.set(element, count + 1);
};

const unobserveElement = (element: Element): void => {
  const count = observedElements.get(element) ?? 0;
  if (count <= 1) {
    elementObserver?.unobserve(element);
    observedElements.delete(element);
  } else {
    observedElements.set(element, count - 1);
  }
};

export const subscribeToTableLayoutChanges = (
  listener: LayoutListener,
  element?: Element | null,
): (() => void) => {
  if (listeners.size === 0) {
    fontSet = document.fonts ?? undefined;
    fontSet?.addEventListener('loadingdone', notifyListeners);
    document.addEventListener('load', onDocumentLoad, true);
    if (typeof MutationObserver !== 'undefined') {
      headObserver = new MutationObserver(onHeadMutation);
      headObserver.observe(document.head, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
  }
  listeners.add(listener);
  if (element) observeElement(element);

  return (): void => {
    listeners.delete(listener);
    if (element) unobserveElement(element);
    if (listeners.size === 0) {
      fontSet?.removeEventListener('loadingdone', notifyListeners);
      document.removeEventListener('load', onDocumentLoad, true);
      headObserver?.disconnect();
      releaseElementObserver();
      fontSet = undefined;
      headObserver = undefined;
    }
  };
};
