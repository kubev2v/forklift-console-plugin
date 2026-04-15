import type { Page } from '@playwright/test';

const MTV_NAMESPACE = 'openshift-mtv';
const MCP_SERVICE_NAME = 'kubectl-mtv-mcp-server';

type LightspeedInterceptOptions = {
  hasLightspeedSubscription: boolean;
  hasMcpService: boolean;
};

const DEFAULT_OPTIONS: LightspeedInterceptOptions = {
  hasLightspeedSubscription: false,
  hasMcpService: false,
};

const buildSubscriptionList = (hasLightspeed: boolean): object => ({
  apiVersion: 'operators.coreos.com/v1alpha1',
  kind: 'SubscriptionList',
  metadata: { resourceVersion: '99999' },
  items: hasLightspeed
    ? [
        {
          apiVersion: 'operators.coreos.com/v1alpha1',
          kind: 'Subscription',
          metadata: {
            name: 'lightspeed-operator',
            namespace: 'openshift-lightspeed',
            uid: 'lightspeed-sub-uid',
          },
          spec: {
            channel: 'stable',
            name: 'lightspeed-operator',
            source: 'redhat-operators',
            sourceNamespace: 'openshift-marketplace',
          },
          status: { state: 'AtLatestKnown' },
        },
      ]
    : [],
});

const buildMcpService = (): object => ({
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    labels: { 'app.kubernetes.io/name': MCP_SERVICE_NAME },
    name: MCP_SERVICE_NAME,
    namespace: MTV_NAMESPACE,
    resourceVersion: '88888',
    uid: 'mcp-service-uid',
  },
  spec: {
    ports: [{ port: 8080, protocol: 'TCP', targetPort: 8080 }],
    selector: { app: MCP_SERVICE_NAME },
  },
});

export const setupLightspeedIntercepts = async (
  page: Page,
  options: LightspeedInterceptOptions = DEFAULT_OPTIONS,
): Promise<void> => {
  const subscriptionList = buildSubscriptionList(options.hasLightspeedSubscription);

  // Block WebSocket watches for subscriptions and services so the SDK
  // relies on the intercepted HTTP responses below.
  await page.routeWebSocket('**/operators.coreos.com/v1alpha1/subscriptions**', (ws) => {
    ws.close();
  });
  await page.routeWebSocket(`**/api/v1/namespaces/${MTV_NAMESPACE}/services**`, (ws) => {
    ws.close();
  });

  await page.route('**/operators.coreos.com/v1alpha1/subscriptions**', async (route) => {
    await route.fulfill({
      body: JSON.stringify(subscriptionList),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.route(`**/api/v1/namespaces/${MTV_NAMESPACE}/services**`, async (route) => {
    const url = route.request().url();

    if (!url.includes(MCP_SERVICE_NAME)) {
      await route.continue();
      return;
    }

    if (options.hasMcpService) {
      await route.fulfill({
        body: JSON.stringify(buildMcpService()),
        contentType: 'application/json',
        status: 200,
      });
    } else {
      await route.fulfill({
        body: JSON.stringify({
          apiVersion: 'v1',
          kind: 'Status',
          message: `services "${MCP_SERVICE_NAME}" not found`,
          reason: 'NotFound',
          status: 'Failure',
        }),
        contentType: 'application/json',
        status: 404,
      });
    }
  });
};
