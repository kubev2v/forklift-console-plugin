// cspell:ignore loadingdone
type LayoutListener = () => void;

const listeners = new Set<LayoutListener>();
let fontSet: FontFaceSet | undefined;
let headObserver: MutationObserver | undefined;

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

export const subscribeToTableLayoutChanges = (listener: LayoutListener): (() => void) => {
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

  return (): void => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      fontSet?.removeEventListener('loadingdone', notifyListeners);
      document.removeEventListener('load', onDocumentLoad, true);
      headObserver?.disconnect();
      fontSet = undefined;
      headObserver = undefined;
    }
  };
};
