import { existsSync, readFileSync } from 'node:fs';

import { KubeConfig } from '@kubernetes/client-node';

import { AUTH_FILE } from '../constants';

type StorageCookie = {
  name: string;
  value: string;
};

type StorageState = {
  cookies: StorageCookie[];
};

export type AuthConfig = {
  baseUrl: string;
  headers: Record<string, string>;
  proxyMode: boolean;
};

const getConsoleBaseUrl = (): string => {
  const baseAddress = process.env.BRIDGE_BASE_ADDRESS ?? process.env.BASE_ADDRESS;
  return (baseAddress ?? 'http://localhost:9000').replace(/\/$/u, '');
};

const tryKubeconfigAuth = (): AuthConfig | null => {
  const kubeconfigPath = process.env.KUBECONFIG_PATH;
  if (!kubeconfigPath || !existsSync(kubeconfigPath)) {
    return null;
  }

  try {
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromFile(kubeconfigPath);
    const cluster = kubeConfig.getCurrentCluster();
    const user = kubeConfig.getCurrentUser();

    if (!cluster?.server || !user?.token) {
      return null;
    }

    return {
      baseUrl: cluster.server.replace(/\/$/u, ''),
      headers: { Authorization: `Bearer ${user.token}` },
      proxyMode: false,
    };
  } catch {
    return null;
  }
};

const getSessionCookies = (): { cookieHeader: string; csrfToken: string } => {
  if (!existsSync(AUTH_FILE)) {
    throw new Error(
      `Auth file not found at "${AUTH_FILE}". Run global setup (login) before resource operations.`,
    );
  }

  const state = JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as StorageState;
  if (!state.cookies.length) {
    throw new Error(
      `No cookies found in auth file "${AUTH_FILE}". Re-run global setup to refresh the session.`,
    );
  }

  const cookieHeader = state.cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
  const csrfCookie = state.cookies.find((cookie) => cookie.name === 'csrf-token');

  return {
    cookieHeader,
    csrfToken: csrfCookie?.value ?? '',
  };
};

export const getAuthConfig = (): AuthConfig => {
  const kubeconfigAuth = tryKubeconfigAuth();
  if (kubeconfigAuth) {
    return kubeconfigAuth;
  }

  const { cookieHeader, csrfToken } = getSessionCookies();
  return {
    baseUrl: getConsoleBaseUrl(),
    headers: {
      Cookie: cookieHeader,
      'X-CSRFToken': csrfToken,
    },
    proxyMode: true,
  };
};
