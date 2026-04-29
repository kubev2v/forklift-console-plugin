import { useCallback, useRef, useState } from 'react';

import { t } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import {
  AAP_CONNECTION_STATUS_CONNECTED,
  AAP_CONNECTION_STATUS_CONNECTING,
  AAP_CONNECTION_STATUS_CONNECTION_FAILED,
  AAP_CONNECTION_STATUS_IDLE,
  type AapConnectionStatus,
} from '../constants';
import { fetchAapJobTemplates } from '../utils';

type AapConnectResult = {
  status: AapConnectionStatus;
  templates: AapJobTemplate[];
};

type UseAapConnectionResult = {
  connect: () => Promise<AapConnectResult | undefined>;
  error: string | null;
  isConnecting: boolean;
  jobTemplates: AapJobTemplate[];
  reset: () => void;
  status: AapConnectionStatus;
};

const useAapConnection = (): UseAapConnectionResult => {
  const [status, setStatus] = useState<AapConnectionStatus>(AAP_CONNECTION_STATUS_IDLE);
  const [jobTemplates, setJobTemplates] = useState<AapJobTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    setStatus(AAP_CONNECTION_STATUS_IDLE);
    setJobTemplates([]);
    setError(null);
  }, []);

  const connect = useCallback(async (): Promise<AapConnectResult | undefined> => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus(AAP_CONNECTION_STATUS_CONNECTING);
    setError(null);

    try {
      const data = await fetchAapJobTemplates(controller.signal);

      if (controller.signal.aborted) {
        return undefined;
      }

      const templates = data.results ?? [];
      setJobTemplates(templates);
      setStatus(AAP_CONNECTION_STATUS_CONNECTED);

      return { status: AAP_CONNECTION_STATUS_CONNECTED, templates };
    } catch (err) {
      if (controller.signal.aborted) {
        return undefined;
      }

      const errorMessage =
        err instanceof Error ? err.message : t('Failed to fetch AAP job templates');
      setStatus(AAP_CONNECTION_STATUS_CONNECTION_FAILED);
      setError(errorMessage);
      setJobTemplates([]);

      return { status: AAP_CONNECTION_STATUS_CONNECTION_FAILED, templates: [] };
    }
  }, []);

  return {
    connect,
    error,
    isConnecting: status === AAP_CONNECTION_STATUS_CONNECTING,
    jobTemplates,
    reset,
    status,
  };
};

export default useAapConnection;
