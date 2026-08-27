import * as http from 'node:http';
import * as https from 'node:https';
import { URL } from 'node:url';

import { getAuthConfig } from './auth';

const PROXY_PREFIX = '/api/kubernetes' as const;
const API_REQUEST_TIMEOUT_MS = 30_000;

export type ApiResult<T> =
  { data: T; status: number; success: true } | { error: string; status: number; success: false };

export type ApiRequestOptions = {
  body?: unknown;
  contentType?: string;
  method: string;
};

export const apiRequest = async <T>(
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
