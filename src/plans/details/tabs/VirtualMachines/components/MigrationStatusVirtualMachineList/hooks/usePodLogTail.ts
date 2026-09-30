import { useCallback, useState } from 'react';

import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { getUID } from '@utils/crds/common/selectors';

import { fetchPodLogTail } from '../utils/fetchPodLogTail';
import { getVirtV2vContainerName } from '../utils/getMigrationLogPod';

type PodLogState = {
  error: Error | undefined;
  loaded: boolean;
  loading: boolean;
  logText: string | undefined;
  podUid: string | undefined;
};

const emptyPodLogState: PodLogState = {
  error: undefined,
  loaded: false,
  loading: false,
  logText: undefined,
  podUid: undefined,
};

type UsePodLogTailResult = {
  error: Error | undefined;
  loaded: boolean;
  loading: boolean;
  loadLogs: () => void;
  logText: string | undefined;
};

export const usePodLogTail = (pod: IoK8sApiCoreV1Pod | undefined): UsePodLogTailResult => {
  const podUid = pod ? getUID(pod) : undefined;
  const [logState, setLogState] = useState<PodLogState>(emptyPodLogState);
  const scopedLogState = logState.podUid === podUid ? logState : emptyPodLogState;

  const loadLogs = useCallback((): void => {
    if (!pod || scopedLogState.loading) {
      return;
    }

    const requestPodUid = getUID(pod);
    setLogState({
      error: undefined,
      loaded: false,
      loading: true,
      logText: undefined,
      podUid: requestPodUid,
    });
    const container = getVirtV2vContainerName(pod);

    fetchPodLogTail(pod, container)
      .then((text) => {
        setLogState((previous) => {
          if (previous.podUid !== requestPodUid) {
            return previous;
          }
          return {
            ...previous,
            loaded: true,
            loading: false,
            logText: text,
          };
        });
      })
      .catch((reason: unknown) => {
        setLogState((previous) => {
          if (previous.podUid !== requestPodUid) {
            return previous;
          }
          return {
            ...previous,
            error: reason instanceof Error ? reason : new Error(String(reason)),
            loaded: true,
            loading: false,
            logText: undefined,
          };
        });
      });
  }, [pod, scopedLogState.loading]);

  return {
    error: scopedLogState.error,
    loaded: scopedLogState.loaded,
    loading: scopedLogState.loading,
    loadLogs,
    logText: scopedLogState.logText,
  };
};
