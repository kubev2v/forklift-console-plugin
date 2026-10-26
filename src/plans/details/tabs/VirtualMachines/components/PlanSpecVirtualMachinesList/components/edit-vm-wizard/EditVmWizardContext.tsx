/* eslint-disable react-refresh/only-export-components -- context module exports the provider and hook */
import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ProviderType, V1beta1Plan } from '@forklift-ui/types';

type EditVmWizardContextValue = {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  selectableDiskAddresses: string[];
  setSelectableDiskAddresses: (addresses: string[]) => void;
  vmIndex: number;
};

const EditVmWizardContext = createContext<EditVmWizardContextValue | null>(null);

type EditVmWizardContextProviderProps = PropsWithChildren & {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  vmIndex: number;
};

export const EditVmWizardContextProvider: FC<EditVmWizardContextProviderProps> = ({
  children,
  plan,
  providerType,
  vmIndex,
}) => {
  const [selectableDiskAddresses, setSelectableDiskAddresses] = useState<string[]>([]);

  const value = useMemo(
    (): EditVmWizardContextValue => ({
      plan,
      providerType,
      selectableDiskAddresses,
      setSelectableDiskAddresses,
      vmIndex,
    }),
    [plan, providerType, selectableDiskAddresses, vmIndex],
  );

  return <EditVmWizardContext.Provider value={value}>{children}</EditVmWizardContext.Provider>;
};

export const useEditVmWizardContext = (): EditVmWizardContextValue => {
  const context = useContext(EditVmWizardContext);
  if (!context) {
    throw new Error('useEditVmWizardContext must be used within EditVmWizardContextProvider');
  }

  return context;
};
