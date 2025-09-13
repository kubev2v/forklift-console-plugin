import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

const useToggleTreeRows = () => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [expandedVMs, setExpandedVMs] = useState<Set<string>>(new Set());

  const toggleSet = useCallback(
    <T extends string>(setFn: Dispatch<SetStateAction<Set<T>>>, id: T) => {
      setFn((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [],
  );

  return { expandedFolders, expandedVMs, setExpandedFolders, setExpandedVMs, toggleSet };
};

export default useToggleTreeRows;
