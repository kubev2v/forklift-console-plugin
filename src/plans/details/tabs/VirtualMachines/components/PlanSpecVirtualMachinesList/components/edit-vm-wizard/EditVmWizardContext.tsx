/* eslint-disable react-refresh/only-export-components -- context module exports the provider and hook */
import { createContext, type FC, type PropsWithChildren, useContext, useMemo } from 'react';

import type { ProviderType, V1beta1Plan } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import type { buildExcludeDiskRows } from '../ExcludeDisks/buildExcludeDiskRows';

import { useEditVmDiskInventory } from './hooks/useEditVmDiskInventory';

type EditVmWizardContextValue = {
  diskLoadError: Error | null;
  isDiskInventoryLoading: boolean;
  plan: V1beta1Plan;
  providerType?: ProviderType;
  rows: ReturnType<typeof buildExcludeDiskRows>;
  selectableDiskAddresses: string[];
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
  const isVsphere = providerType === PROVIDER_TYPES.vsphere;
  const { diskLoadError, isInventoryLoading, rows, selectableAddresses } = useEditVmDiskInventory(
    plan,
    vmIndex,
    isVsphere,
  );

  const value = useMemo(
    (): EditVmWizardContextValue => ({
      diskLoadError: isVsphere ? diskLoadError : null,
      isDiskInventoryLoading: isVsphere ? isInventoryLoading : false,
      plan,
      providerType,
      rows: isVsphere ? rows : [],
      selectableDiskAddresses: isVsphere ? selectableAddresses : [],
      vmIndex,
    }),
    [
      diskLoadError,
      isInventoryLoading,
      isVsphere,
      plan,
      providerType,
      rows,
      selectableAddresses,
      vmIndex,
    ],
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
