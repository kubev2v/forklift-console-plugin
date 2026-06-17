import { existsSync, readFileSync } from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import { URL } from 'node:url';

import { KubeConfig } from '@kubernetes/client-node';

import { AUTH_FILE } from '../constants';

import { RESOURCE_KINDS, RESOURCE_TYPES } from './constants';

// The console proxy strips this prefix before forwarding to the k8s API server.
// When calling the API server directly we strip it ourselves so the path
// reaches the correct endpoint (e.g. /apis/... instead of /api/kubernetes/apis/...).
const PROXY_PREFIX = '/api/kubernetes' as const;

type ApiResult<T> =
  | { data: T; status: number; success: true }
  | { error: string; status: number; success: false };

type ApiRequestOptions = {
  body?: unknown;
  contentType?: string;
  method: string;
};

type AuthConfig = {
  baseUrl: string;
  headers: Record<string, string>;
  /** true  → talking to console proxy (cookies); false → direct API server (bearer token) */
  proxyMode: boolean;
};

type StorageCookie = {
  name: string;
  value: string;
};

type StorageState = {
  cookies: StorageCookie[];
};

/**
 * Tries to load kubeconfig from KUBECONFIG_PATH (relayed from globalSetup via ENV_RELAY_FILE).
 * Returns null when the path is unset, the file is missing, or the config is invalid.
 */
const tryKubeconfigAuth = (): AuthConfig | null => {
  const kubeconfigPath = process.env.KUBECONFIG_PATH;
  if (!kubeconfigPath || !existsSync(kubeconfigPath)) return null;

  try {
    const kc = new KubeConfig();
    kc.loadFromFile(kubeconfigPath);
    const cluster = kc.getCurrentCluster();
    const user = kc.getCurrentUser();
    if (!cluster?.server || !user?.token) return null;

    return {
      baseUrl: cluster.server.replace(/\/$/, ''),
      headers: { Authorization: `Bearer ${user.token}` },
      proxyMode: false,
    };
  } catch {
    return null;
  }
};

/**
 * Reads session cookies from the saved Playwright storageState file.
 * These cookies are written by global.setup.ts after browser login and
 * are the same credentials the browser would use — but now consumed
 * directly by Node.js HTTP calls so that no browser page is required.
 */
const getSessionCookies = (): { sessionToken: string; csrfToken: string } => {
  if (!existsSync(AUTH_FILE)) {
    throw new Error(
      `Auth file not found at "${AUTH_FILE}". ` +
        'Run global setup (login) before resource operations.',
    );
  }

  const state = JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as StorageState;
  const sessionCookie = state.cookies.find((cookie) => cookie.name === 'openshift-session-token');
  const csrfCookie = state.cookies.find((cookie) => cookie.name === 'csrf-token');

  if (!sessionCookie?.value) {
    throw new Error(
      'openshift-session-token not found in auth file. ' +
        'Re-run global setup to refresh the session.',
    );
  }

  return {
    sessionToken: sessionCookie.value,
    csrfToken: csrfCookie?.value ?? '',
  };
};

const getConsoleBaseUrl = (): string =>
  (process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS ?? 'http://localhost:9000').replace(
    /\/$/,
    '',
  );

/**
 * Returns the auth config to use for this request.
 * Priority: kubeconfig (direct API server) → session cookies (console proxy).
 */
const getAuthConfig = (): AuthConfig => {
  const kubeconfigAuth = tryKubeconfigAuth();
  if (kubeconfigAuth) return kubeconfigAuth;

  const { sessionToken, csrfToken } = getSessionCookies();
  return {
    baseUrl: getConsoleBaseUrl(),
    headers: {
      Cookie: sessionToken,
      'X-CSRFToken': csrfToken,
    },
    proxyMode: true,
  };
};

/**
 * Base class providing shared Node.js HTTP functionality for resource managers.
 *
 * Auth mode is resolved at call time:
 *  - **Kubeconfig mode** (preferred): uses the kubeconfig written by globalSetup after
 *    `oc login`. Talks directly to the cluster API server with a long-lived Bearer token.
 *    Session expiry only affects UI test steps, not resource operations.
 *  - **Cookie fallback**: when no kubeconfig is available, falls back to the OpenShift
 *    console proxy (/api/kubernetes/...) using the session cookies saved in AUTH_FILE.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseResourceManager {
  static async apiDelete<R>(apiPath: string): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(apiPath, { method: 'DELETE' });

    if (result.success) return result.data;

    console.error(`API DELETE ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiGet<R>(apiPath: string): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(apiPath, { method: 'GET' });

    if (result.success) return result.data;

    console.error(`API GET ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiPatch<R>(
    apiPath: string,
    data: unknown,
    contentType = 'application/merge-patch+json',
  ): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(apiPath, {
      body: data,
      contentType,
      method: 'PATCH',
    });

    if (result.success) return result.data;

    console.error(`API PATCH ${apiPath} failed: ${result.error}`);
    return null;
  }

  static async apiPost<R>(apiPath: string, data: unknown): Promise<R | null> {
    const result = await BaseResourceManager.apiRequest<R>(apiPath, {
      body: data,
      method: 'POST',
    });

    if (result.success) return result.data;

    const HTTP_CONFLICT = 409;

    if (result.status === HTTP_CONFLICT) {
      console.warn(`API POST to ${apiPath}: resource already exists (409)`);
    } else {
      console.error(`API POST to ${apiPath} failed: ${result.error}`);
    }

    return null;
  }

  private static async apiRequest<R>(
    apiPath: string,
    options: ApiRequestOptions,
  ): Promise<ApiResult<R>> {
    const { baseUrl, headers, proxyMode } = getAuthConfig();

    // In direct (kubeconfig) mode the caller's path still carries the console proxy
    // prefix — strip it so the request reaches the correct API server endpoint.
    const adjustedPath =
      proxyMode || !apiPath.startsWith(PROXY_PREFIX) ? apiPath : apiPath.slice(PROXY_PREFIX.length);

    const fullUrl = new URL(adjustedPath || '/', baseUrl);
    const isHttps = fullUrl.protocol === 'https:';
    const transport = isHttps ? https : http;
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);

    const cookieHeader = csrfToken
      ? `openshift-session-token=${sessionToken}; csrf-token=${csrfToken}`
      : `openshift-session-token=${sessionToken}`;

    return new Promise((resolve) => {
      const reqOptions: https.RequestOptions = {
        hostname: fullUrl.hostname,
        port: fullUrl.port || (isHttps ? 443 : 80),
        path: fullUrl.pathname + fullUrl.search,
        method: options.method,
        rejectUnauthorized: false,
        headers: {
          Accept: 'application/json',
          'Content-Type': options.contentType ?? 'application/json',
          ...headers,
          ...(body ? { 'Content-Length': String(Buffer.byteLength(body)) } : {}),
        },
      };

      const req = transport.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) {
            try {
              resolve({ data: JSON.parse(data) as R, status, success: true });
            } catch {
              resolve({ data: data as unknown as R, status, success: true });
            }
          } else {
            resolve({ error: data || `HTTP ${status}`, status, success: false });
          }
        });
      });

      req.on('error', (err: Error) => {
        resolve({ error: err.message, status: 0, success: false });
      });

      if (body) req.write(body);
      req.end();
    });
  }

  static getResourceTypeFromKind(kind: string): string {
    const kindToType: Record<string, string> = {
      [RESOURCE_KINDS.FORKLIFT_CONTROLLER]: RESOURCE_TYPES.FORKLIFT_CONTROLLERS,
      [RESOURCE_KINDS.MIGRATION]: RESOURCE_TYPES.MIGRATIONS,
      [RESOURCE_KINDS.NETWORK_MAP]: RESOURCE_TYPES.NETWORK_MAPS,
      [RESOURCE_KINDS.NETWORK_ATTACHMENT_DEFINITION]: RESOURCE_TYPES.NETWORK_ATTACHMENT_DEFINITIONS,
      [RESOURCE_KINDS.PLAN]: RESOURCE_TYPES.PLANS,
      [RESOURCE_KINDS.PROVIDER]: RESOURCE_TYPES.PROVIDERS,
      [RESOURCE_KINDS.SECRET]: RESOURCE_TYPES.SECRETS,
      [RESOURCE_KINDS.STORAGE_MAP]: RESOURCE_TYPES.STORAGE_MAPS,
      [RESOURCE_KINDS.VIRTUAL_MACHINE]: RESOURCE_TYPES.VIRTUAL_MACHINES,
      [RESOURCE_KINDS.PROJECT]: RESOURCE_TYPES.PROJECTS,
      [RESOURCE_KINDS.NAMESPACE]: RESOURCE_TYPES.NAMESPACES,
    };

    return kindToType[kind] ?? `${kind.toLowerCase()}s`;
  }
}
