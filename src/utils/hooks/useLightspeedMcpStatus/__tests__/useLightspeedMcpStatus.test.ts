import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { LIGHTSPEED_OPERATOR_PACKAGE, SubscriptionModelGroupVersionKind } from '../constants';
import { useLightspeedMcpStatus } from '../useLightspeedMcpStatus';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: jest.fn(),
}));

const mockUseK8sWatchResource = useK8sWatchResource as jest.MockedFunction<
  typeof useK8sWatchResource
>;

const lightspeedSubscription = {
  metadata: { name: 'lightspeed-operator', namespace: 'openshift-operators' },
  spec: { name: LIGHTSPEED_OPERATOR_PACKAGE },
};

const otherSubscription = {
  metadata: { name: 'some-operator', namespace: 'openshift-operators' },
  spec: { name: 'some-other-operator' },
};

const mcpService = {
  metadata: { name: 'kubectl-mtv-mcp-server', namespace: 'openshift-mtv' },
};

type MockResponses = {
  mcpServiceResponse: [unknown, boolean, Error | undefined];
  subscriptions: [unknown[], boolean, Error | undefined];
};

const setupMocks = ({ subscriptions, mcpServiceResponse }: MockResponses): void => {
  (mockUseK8sWatchResource as jest.Mock).mockImplementation((...args: unknown[]) => {
    const resource = args[0] as { groupVersionKind: unknown };

    if (resource.groupVersionKind === SubscriptionModelGroupVersionKind) {
      return subscriptions;
    }

    return mcpServiceResponse;
  });
};

describe('useLightspeedMcpStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loaded: false while queries are resolving', () => {
    setupMocks({
      mcpServiceResponse: [undefined, false, undefined],
      subscriptions: [[], false, undefined],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(false);
    expect(result.current.showMcpWarning).toBe(false);
  });

  it('returns showMcpWarning: false when no Lightspeed subscription exists', () => {
    setupMocks({
      mcpServiceResponse: [undefined, true, new Error('not found')],
      subscriptions: [[otherSubscription], true, undefined],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(true);
    expect(result.current.showMcpWarning).toBe(false);
  });

  it('returns showMcpWarning: false when both Lightspeed and MCP service exist', () => {
    setupMocks({
      mcpServiceResponse: [mcpService, true, undefined],
      subscriptions: [[lightspeedSubscription], true, undefined],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(true);
    expect(result.current.showMcpWarning).toBe(false);
  });

  it('returns showMcpWarning: true when Lightspeed exists but MCP service is missing', () => {
    setupMocks({
      mcpServiceResponse: [undefined, true, undefined],
      subscriptions: [[lightspeedSubscription], true, undefined],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(true);
    expect(result.current.showMcpWarning).toBe(true);
  });

  it('returns showMcpWarning: false when Subscription query errors (RBAC)', () => {
    setupMocks({
      mcpServiceResponse: [undefined, true, new Error('not found')],
      subscriptions: [[], false, new Error('forbidden')],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(true);
    expect(result.current.showMcpWarning).toBe(false);
  });

  it('returns showMcpWarning: true when Lightspeed exists and Service returns 404', () => {
    setupMocks({
      mcpServiceResponse: [undefined, false, new Error('not found')],
      subscriptions: [[lightspeedSubscription], true, undefined],
    });

    const { result } = renderHook(() => useLightspeedMcpStatus());

    expect(result.current.loaded).toBe(true);
    expect(result.current.showMcpWarning).toBe(true);
  });
});
