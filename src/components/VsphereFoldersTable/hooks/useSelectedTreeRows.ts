import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { isEmpty } from '@utils/helpers';

import type { UseTreeRowsControls } from './utils/types';

type UseSelectedTreeRows = (controls?: UseTreeRowsControls) => {
  onCheckChange: (
    keys: string | string[],
  ) => (_event: FormEvent<HTMLInputElement>, isChecked: boolean) => void;
  selectedSet: Set<string>;
  selectedVmKeys: string[];
  setSelectedVmKeys: (updater: SetStateAction<string[]>) => void;
  setShowAll: Dispatch<SetStateAction<boolean>>;
  showAll: boolean;
};

const useSelectedTreeRows: UseSelectedTreeRows = (controls) => {
  const [internalSelected, internalSetSelected] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true); // a toggle to show either select rows/all rows

  const selectedVmKeys = controls?.selectedVmKeys ?? internalSelected;

  const setSelectedVmKeys = useCallback(
    (updater: SetStateAction<string[]>) => {
      if (!controls) {
        internalSetSelected(updater);
        return;
      }
      const prev = controls.selectedVmKeys ?? [];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (isEmpty(next) && !showAll) {
        setShowAll(true);
      }
      controls.setSelectedVmKeys(next);
    },
    [controls, showAll],
  );

  const onCheckChange = useCallback(
    (keys: string | string[]) => (_event: FormEvent<HTMLInputElement>, isChecked: boolean) => {
      setSelectedVmKeys((prev) => {
        const next = new Set(prev);
        if (Array.isArray(keys)) {
          if (isChecked) {
            for (const id of keys) next.add(id);
          } else {
            for (const id of keys) next.delete(id);
          }

          return Array.from(next);
        }

        if (typeof keys === 'string') {
          if (isChecked) {
            next.add(keys);
          } else {
            next.delete(keys);
          }
        }

        return Array.from(next);
      });
    },
    [setSelectedVmKeys],
  );

  const selectedSet = useMemo(() => new Set(selectedVmKeys), [selectedVmKeys]);

  return { onCheckChange, selectedSet, selectedVmKeys, setSelectedVmKeys, setShowAll, showAll };
};

export default useSelectedTreeRows;
