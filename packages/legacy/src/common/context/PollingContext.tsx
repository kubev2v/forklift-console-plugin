import { POLLING_INTERVAL } from 'legacy/src/queries/constants';
import * as React from 'react';

interface IPollingContext {
  isPollingEnabled: boolean;
  refetchInterval: number | false;
  pausePolling: () => void;
  resumePolling: () => void;
}

const PollingContext = React.createContext<IPollingContext>({
  isPollingEnabled: true,
  refetchInterval: POLLING_INTERVAL,
  pausePolling: () => undefined,
  resumePolling: () => undefined,
});

interface IPollingContextProviderProps {
  children: React.ReactNode;
}

export const PollingContextProvider: React.FunctionComponent<IPollingContextProviderProps> = ({
  children,
}: IPollingContextProviderProps) => {
  const [isPollingEnabled, setIsPollingEnabled] = React.useState(true);

  const refetchInterval = !isPollingEnabled ? false : POLLING_INTERVAL;

  return (
    <PollingContext.Provider
      value={{
        isPollingEnabled,
        refetchInterval,
        pausePolling: () => setIsPollingEnabled(false),
        resumePolling: () => setIsPollingEnabled(true),
      }}
    >
      {children}
    </PollingContext.Provider>
  );
};

export const usePollingContext = (): IPollingContext => React.useContext(PollingContext);

export const usePausedPollingEffect = (shouldPause = true): void => {
  // Pauses polling when a component mounts, resumes when it unmounts. If shouldPause changes while mounted, polling pauses/resumes to match.
  const { pausePolling, resumePolling } = usePollingContext();
  React.useEffect(() => {
    if (shouldPause) {
      pausePolling();
    } else {
      resumePolling();
    }
    return resumePolling;
  }, [pausePolling, resumePolling, shouldPause]);
};
