import { type K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Namespace } from '@utils/constants';

import {
  LIGHTSPEED_OPERATOR_PACKAGE,
  MTV_MCP_SERVICE_NAME,
  ServiceModelGroupVersionKind,
  SubscriptionModelGroupVersionKind,
} from './constants';

type UseLightspeedMcpStatusResult = {
  loaded: boolean;
  showMcpWarning: boolean;
};

export const useLightspeedMcpStatus = (): UseLightspeedMcpStatusResult => {
  const [subscriptions, subscriptionsLoaded, subscriptionsError] = useK8sWatchResource<
    K8sResourceKind[]
  >({
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: true,
  });

  const [mcpService, mcpServiceLoaded, mcpServiceError] = useK8sWatchResource<K8sResourceKind>({
    groupVersionKind: ServiceModelGroupVersionKind,
    name: MTV_MCP_SERVICE_NAME,
    namespace: Namespace.OpenshiftMtv,
    namespaced: true,
  });

  const loaded =
    (subscriptionsLoaded || Boolean(subscriptionsError)) &&
    (mcpServiceLoaded || Boolean(mcpServiceError));

  if (!loaded || subscriptionsError) {
    return { loaded, showMcpWarning: false };
  }

  const hasLightspeed =
    subscriptions?.some(
      (sub) => (sub.spec as Record<string, unknown>)?.name === LIGHTSPEED_OPERATOR_PACKAGE,
    ) ?? false;

  // Service watch returns an error when the resource doesn't exist (404),
  // which is the expected case when the MCP service hasn't been deployed.
  const hasMcpService = mcpServiceLoaded && !mcpServiceError && Boolean(mcpService);

  return {
    loaded,
    showMcpWarning: hasLightspeed && !hasMcpService,
  };
};
