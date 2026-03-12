import { Namespace } from '@utils/constants';

// Service name from https://github.com/yaacov/kubectl-mtv/blob/main/deploy/mcp-server.yaml
export const MTV_MCP_SERVICE_NAME = 'kubectl-mtv-mcp-server';

export const INSTALLED_OPERATORS_URL = `/k8s/ns/${Namespace.OpenshiftMtv}/operators.coreos.com~v1alpha1~ClusterServiceVersion`;

export const LIGHTSPEED_OPERATOR_PACKAGE = 'lightspeed-operator';

export const ServiceModelGroupVersionKind = {
  group: '',
  kind: 'Service',
  version: 'v1',
};

export const SubscriptionModelGroupVersionKind = {
  group: 'operators.coreos.com',
  kind: 'Subscription',
  version: 'v1alpha1',
};
