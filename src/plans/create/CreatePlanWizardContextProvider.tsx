import { type PropsWithChildren, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';

import useTargetStorages from '@utils/hooks/useTargetStorages';

import { useCreatePlanFormContext } from './hooks/useCreatePlanFormContext';
import { useOpenshiftStorageClasses } from './hooks/useOpenshiftStorageClasses';
import { useOvirtDisksForVMs } from './hooks/useOvirtDisksForVMs';
import { useOvirtNicProfiles } from './hooks/useOvirtNicProfiles';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { VmFormFieldId } from './steps/virtual-machines/constants';
import { CreatePlanWizardContext } from './constants';
import type { ProviderVirtualMachine } from './types';

const CreatePlanWizardContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { control } = useCreatePlanFormContext();

  const [sourceProvider, targetProvider, targetProject, vms] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.TargetProject,
      VmFormFieldId.Vms,
    ],
  });

  // Fetch network and storage data based on selected providers.
  const sourceNetworksResult = useSourceNetworks(sourceProvider);
  const targetNetworksResult = useOpenShiftNetworks(targetProvider);
  const oVirtNicProfilesResult = useOvirtNicProfiles(sourceProvider);
  const sourceStoragesResult = useSourceStorages(sourceProvider);
  const targetStoragesResult = useTargetStorages(targetProvider, targetProject);

  // Fetch VMs with disk information for oVirt providers
  const vmList = Object.values(vms || {});
  const {
    error: vmsWithDisksError,
    loading: vmsWithDisksLoading,
    vmsWithDisks,
  } = useOvirtDisksForVMs(sourceProvider, vmList);

  const vmsWithDisksResult: [ProviderVirtualMachine[], boolean, Error | null] = useMemo(
    () => [vmsWithDisks as ProviderVirtualMachine[], vmsWithDisksLoading, vmsWithDisksError],
    [vmsWithDisks, vmsWithDisksLoading, vmsWithDisksError],
  );

  // Extract storage classes from OpenShift VMs' dataVolumeTemplates
  const {
    error: usedStorageClassesError,
    loading: usedStorageClassesLoading,
    usedStorageClasses,
  } = useOpenshiftStorageClasses(sourceProvider, vmList);

  const usedStorageClassesResult: [Set<string>, boolean, Error | null] = useMemo(
    () => [usedStorageClasses, usedStorageClassesLoading, usedStorageClassesError],
    [usedStorageClasses, usedStorageClassesLoading, usedStorageClassesError],
  );

  const value = useMemo(
    () => ({
      network: {
        oVirtNicProfiles: oVirtNicProfilesResult,
        sources: sourceNetworksResult,
        targets: targetNetworksResult,
      },
      storage: {
        sources: sourceStoragesResult,
        targets: targetStoragesResult,
        usedStorageClasses: usedStorageClassesResult,
      },
      vmsWithDisks: vmsWithDisksResult,
    }),
    [
      oVirtNicProfilesResult,
      sourceNetworksResult,
      sourceStoragesResult,
      targetNetworksResult,
      targetStoragesResult,
      usedStorageClassesResult,
      vmsWithDisksResult,
    ],
  );

  return (
    <CreatePlanWizardContext.Provider value={value}>{children}</CreatePlanWizardContext.Provider>
  );
};

export default CreatePlanWizardContextProvider;
