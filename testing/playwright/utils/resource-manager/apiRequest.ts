import * as http from 'node:http';
import * as https from 'node:https';
import { URL } from 'node:url';

import { testWarn } from '../testLog';

import { getAuthConfig } from './auth';

const PROXY_PREFIX = '/api/kubernetes' as const;
const API_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_RETRY_AFTER_MS = 1_000;
const HTTP_SERVICE_UNAVAILABLE = 503;
const HTTP_TOO_MANY_REQUESTS = 429;
const MAX_TRANSIENT_RETRIES = 5;

export type ApiResult<T> =
  { data: T; status: number; success: true } | { error: string; status: number; success: false };

export type ApiRequestOptions = {
  body?: unknown;
  contentType?: string;
  method: string;
};

const isTransientStatus = (status: number): boolean =>
  status === HTTP_TOO_MANY_REQUESTS || status === HTTP_SERVICE_UNAVAILABLE;

const parseRetryAfterMs = (errorBody: string): number => {
  try {
    const parsed = JSON.parse(errorBody) as {
      details?: { retryAfterSeconds?: number };
    };
    const seconds = parsed.details?.retryAfterSeconds;
    if (typeof seconds === 'number' && seconds >= 0) {
      return seconds * 1000;
    }
  } catch {
    // Non-JSON error body — use default backoff.
  }

  return DEFAULT_RETRY_AFTER_MS;
};

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const singleApiRequest = async <T>(
  apiPath: string,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> => {
  const { baseUrl, headers, proxyMode } = getAuthConfig();
  const adjustedPath =
    proxyMode || !apiPath.startsWith(PROXY_PREFIX) ? apiPath : apiPath.slice(PROXY_PREFIX.length);
  const fullUrl = new URL(adjustedPath || '/', baseUrl);
  const isHttps = fullUrl.protocol === 'https:';
  const transport = isHttps ? https : http;
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);

  return new Promise((resolve) => {
    const requestOptions: https.RequestOptions = {
      headers: {
        Accept: 'application/json',
        'Content-Type': options.contentType ?? 'application/json',
        ...headers,
        ...(body ? { 'Content-Length': String(Buffer.byteLength(body)) } : {}),
      },
      hostname: fullUrl.hostname,
      method: options.method,
      path: fullUrl.pathname + fullUrl.search,
      port: fullUrl.port || (isHttps ? 443 : 80),
      rejectUnauthorized: false,
      timeout: API_REQUEST_TIMEOUT_MS,
    };

    const request = transport.request(requestOptions, (response) => {
      let data = '';
      response.on('data', (chunk: string) => {
        data += chunk;
      });

      response.on('end', () => {
        const status = response.statusCode ?? 0;
        if (status >= 200 && status < 300) {
          try {
            resolve({ data: JSON.parse(data) as T, status, success: true });
          } catch {
            resolve({ data: data as T, status, success: true });
          }
          return;
        }

        resolve({ error: data || `HTTP ${status}`, status, success: false });
      });
    });

    request.on('timeout', () => {
      request.destroy(
        new Error(`API ${options.method} ${apiPath} timed out after ${API_REQUEST_TIMEOUT_MS}ms`),
      );
    });

    request.on('error', (error: Error) => {
      resolve({ error: error.message, status: 0, success: false });
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
};

/** Retries 429/503 (e.g. API server "storage is (re)initializing") using retryAfterSeconds. */
export const apiRequest = async <T>(
  apiPath: string,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> => {
  for (let attempt = 0; ; attempt += 1) {
    const result = await singleApiRequest<T>(apiPath, options);
    if (result.success || !isTransientStatus(result.status) || attempt >= MAX_TRANSIENT_RETRIES) {
      return result;
    }

    const waitMs = parseRetryAfterMs(result.error);
    testWarn(
      `API ${options.method} ${apiPath} returned ${result.status}; retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_TRANSIENT_RETRIES})`,
    );
    await delay(waitMs);
  }
};
