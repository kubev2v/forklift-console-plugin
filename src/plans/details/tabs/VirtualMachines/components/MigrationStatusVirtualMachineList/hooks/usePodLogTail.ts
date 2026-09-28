import { useCallback, useState } from 'react';

import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';

import { fetchPodLogTail } from '../utils/fetchPodLogTail';
import { getVirtV2vContainerName } from '../utils/getMigrationLogPod';

type UsePodLogTailResult = {
  error: Error | undefined;
  loaded: boolean;
  loading: boolean;
  loadLogs: () => void;
  logText: string | undefined;
};

export const usePodLogTail = (pod: IoK8sApiCoreV1Pod | undefined): UsePodLogTailResult => {
  const [logText, setLogText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const loadLogs = useCallback((): void => {
    if (!pod || loading) {
      return;
    }

    setLoading(true);
    setError(undefined);
    const container = getVirtV2vContainerName(pod);

    fetchPodLogTail(pod, container)
      .then((text) => {
        setLogText(text);
        setLoaded(true);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason : new Error(String(reason)));
        setLogText(undefined);
        setLoaded(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loading, pod]);

  return { error, loaded, loading, loadLogs, logText };
};
