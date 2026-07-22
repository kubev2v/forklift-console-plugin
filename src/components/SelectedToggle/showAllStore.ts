export type ShowAllStore = {
  getSnapshot: () => boolean;
  setShowAll: (showAll: boolean) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export const createShowAllStore = (): ShowAllStore => {
  let showAll = true;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: (): boolean => showAll,
    setShowAll: (nextShowAll: boolean): void => {
      if (nextShowAll === showAll) {
        return;
      }
      showAll = nextShowAll;
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (onStoreChange: () => void): (() => void) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
  };
};
