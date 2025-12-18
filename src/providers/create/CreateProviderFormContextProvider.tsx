import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { useK8sWatchProviderNames } from '../../modules/Providers/hooks/useK8sWatchProviderNames';

import { CreateProviderFormContext } from './constants';

const CreateProviderFormContextProvider: FC<PropsWithChildren<{ namespace: string }>> = ({
  children,
  namespace,
}) => {
  const [providerNames, providerNamesLoaded] = useK8sWatchProviderNames({ namespace });

  const value = useMemo(
    () => ({
      providerNames,
      providerNamesLoaded,
    }),
    [providerNames, providerNamesLoaded],
  );

  return (
    <CreateProviderFormContext.Provider value={value}>
      {children}
    </CreateProviderFormContext.Provider>
  );
};

export default CreateProviderFormContextProvider;
