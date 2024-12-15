import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { produce } from 'immer';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';

import { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';

import { VmData } from '../details';

export interface CreateVmMigrationContextData {
  selectedVms: VmData[];
  provider?: V1beta1Provider;
  planName?: string;
  projectName?: string;
  targetProvider?: V1beta1Provider;
  plan?: V1beta1Plan;
  editAction?: PlanEditAction;
}

export interface CreateVmMigrationContextType {
  data?: CreateVmMigrationContextData;
  setData?: (data: CreateVmMigrationContextData) => void;
}

export const CreateVmMigrationContext = createContext<CreateVmMigrationContextType>({
  setData: () => undefined,
});

export const CreateVmMigrationProvider = CreateVmMigrationContext.Provider;

/* Provides value for the context via useValueHook extension point
 */
export const useCreateVmMigrationContextValue = (): CreateVmMigrationContextType => {
  const [data, setData] = useState<CreateVmMigrationContextData>();

  // use the same approach as useSafetyFirst() hook
  // https://github.com/openshift/console/blob/9d4a9b0a01b2de64b308f8423a325f1fae5f8726/frontend/packages/console-dynamic-plugin-sdk/src/app/components/safety-first.tsx#L10
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const setValueSafe = useCallback((newValue) => {
    if (mounted.current) {
      setData(newValue);
    }
  }, []);

  return useMemo(
    () => ({
      data,
      setData: (newState: CreateVmMigrationContextData) => setValueSafe(produce(() => newState)),
    }),
    [data, setData],
  );
};

/* Abstraction layer to separate the code from the current data passing implementation (context).
 */
export const useCreateVmMigrationData = () => useContext(CreateVmMigrationContext);
