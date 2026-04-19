import { useMemo } from 'react';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchForkliftController';
import type { EnhancedForkliftController } from 'src/overview/tabs/Settings/utils/types';
import { SettingsFields } from 'src/overview/tabs/Settings/utils/types';

type AapConfig = {
  aapTimeout: number | undefined;
  aapUrl: string | undefined;
  error: Error | null;
  isConfigured: boolean;
  loaded: boolean;
  tokenSecretName: string | undefined;
};

const useAapConfig = (): AapConfig => {
  const [controller, loaded, error] = useK8sWatchForkliftController();

  return useMemo((): AapConfig => {
    if (!loaded) {
      return {
        aapTimeout: undefined,
        aapUrl: undefined,
        error,
        isConfigured: false,
        loaded: false,
        tokenSecretName: undefined,
      };
    }

    const spec = (controller as EnhancedForkliftController)?.spec;
    const aapUrl = spec?.[SettingsFields.AapUrl];
    const tokenSecretName = spec?.[SettingsFields.AapTokenSecretName];
    const aapTimeout = spec?.[SettingsFields.AapTimeout];
    const isConfigured = Boolean(aapUrl?.trim()) && Boolean(tokenSecretName?.trim());

    return {
      aapTimeout,
      aapUrl,
      error,
      isConfigured,
      loaded: true,
      tokenSecretName,
    };
  }, [controller, loaded, error]);
};

export default useAapConfig;
