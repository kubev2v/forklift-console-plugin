import { type PropsWithChildren, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';

import useTargetStorages from '@utils/hooks/useTargetStorages';

import { useCreatePlanFormContext } from './hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { CreatePlanWizardContext } from './constants';

const CreatePlanWizardContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { control } = useCreatePlanFormContext();

  const [sourceProvider, targetProvider, targetProject] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.TargetProject,
    ],
  });

  // Fetch network and storage data based on selected providers.
  const sourceNetworksResult = useSourceNetworks(sourceProvider);
  const targetNetworksResult = useOpenShiftNetworks(targetProvider);
  const sourceStoragesResult = useSourceStorages(sourceProvider);
  const targetStoragesResult = useTargetStorages(targetProvider, targetProject);

  const value = useMemo(
    () => ({
      network: {
        sources: sourceNetworksResult,
        targets: targetNetworksResult,
      },
      storage: {
        sources: sourceStoragesResult,
        targets: targetStoragesResult,
      },
    }),
    [sourceNetworksResult, sourceStoragesResult, targetNetworksResult, targetStoragesResult],
  );

  return (
    <CreatePlanWizardContext.Provider value={value}>{children}</CreatePlanWizardContext.Provider>
  );
};

export default CreatePlanWizardContextProvider;
