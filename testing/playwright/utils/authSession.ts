import { existsSync, statSync } from 'node:fs';

import { type APIRequestContext, request } from '@playwright/test';

import { AUTH_FILE } from './constants';

const AUTH_SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const AUTH_SESSION_CHECK_TIMEOUT_MS = 10_000;
const MIN_AUTH_FILE_SIZE_BYTES = 50;
const CURRENT_USER_PATH = '/api/kubernetes/apis/user.openshift.io/v1/users/~';

export const shouldReuseExistingAuth = async (
  baseURL: string,
  username: string,
): Promise<boolean> => {
  if (process.env.PLAYWRIGHT_FORCE_LOGIN === '1' || !existsSync(AUTH_FILE)) {
    return false;
  }

  let context: APIRequestContext | undefined;
  try {
    const { mtimeMs, size } = statSync(AUTH_FILE);
    if (size <= MIN_AUTH_FILE_SIZE_BYTES || Date.now() - mtimeMs >= AUTH_SESSION_MAX_AGE_MS) {
      return false;
    }

    context = await request.newContext({
      baseURL,
      ignoreHTTPSErrors: true,
      storageState: AUTH_FILE,
      timeout: AUTH_SESSION_CHECK_TIMEOUT_MS,
    });
    const response = await context.get(CURRENT_USER_PATH);
    if (!response.ok()) {
      return false;
    }

    const user: unknown = await response.json();
    if (typeof user !== 'object' || user === null || !('metadata' in user)) {
      return false;
    }

    const { metadata } = user;
    return (
      typeof metadata === 'object' &&
      metadata !== null &&
      'name' in metadata &&
      metadata.name === username
    );
  } catch {
    return false;
  } finally {
    await context?.dispose().catch(() => undefined);
  }
};
