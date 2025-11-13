import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE } from './constants';

export const createProvider = async (
  page: Page,
  provider: V1beta1Provider,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1Provider | null> => {
  try {
    const constants = BaseResourceManager.getEvaluateConstants();
    const result = await page.evaluate(
      async ({ providerData, ns, evalConstants }) => {
        try {
          const getCsrfTokenFromCookie = () => {
            const cookies = document.cookie.split('; ');
            const csrfCookie = cookies.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            return csrfCookie ? csrfCookie.split('=')[1] : '';
          };
          const csrfToken = getCsrfTokenFromCookie();

          const apiPath = `${evalConstants.FORKLIFT_PATH}/namespaces/${ns}/providers`;

          const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(providerData),
          });

          if (response.ok) {
            return { success: true, data: await response.json() };
          }

          const errorText = await response.text().catch(() => response.statusText);
          return { success: false, error: errorText };
        } catch (error: unknown) {
          const err = error as Error;
          return {
            success: false,
            error: err?.message ?? String(error),
          };
        }
      },
      {
        providerData: provider,
        ns: namespace,
        evalConstants: constants,
      },
    );

    if (result.success && result.data) {
      return result.data as V1beta1Provider;
    }

    console.error(`Failed to create provider: ${result.error}`);
    return null;
  } catch (error) {
    console.error('Exception while creating provider:', error);
    return null;
  }
};

export const createSecret = async (
  page: Page,
  secret: IoK8sApiCoreV1Secret,
  namespace = MTV_NAMESPACE,
): Promise<IoK8sApiCoreV1Secret | null> => {
  try {
    const constants = BaseResourceManager.getEvaluateConstants();
    const result = await page.evaluate(
      async ({ secretData, ns, evalConstants }) => {
        try {
          const getCsrfTokenFromCookie = () => {
            const cookies = document.cookie.split('; ');
            const csrfCookie = cookies.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            return csrfCookie ? csrfCookie.split('=')[1] : '';
          };
          const csrfToken = getCsrfTokenFromCookie();

          const apiPath = `${evalConstants.KUBERNETES_CORE}/namespaces/${ns}/secrets`;

          const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(secretData),
          });

          if (response.ok) {
            return { success: true, data: await response.json() };
          }

          const errorText = await response.text().catch(() => response.statusText);
          return { success: false, error: errorText };
        } catch (error: unknown) {
          const err = error as Error;
          return {
            success: false,
            error: err?.message ?? String(error),
          };
        }
      },
      {
        secretData: secret,
        ns: namespace,
        evalConstants: constants,
      },
    );

    if (result.success && result.data) {
      return result.data as IoK8sApiCoreV1Secret;
    }

    console.error(`Failed to create secret: ${result.error}`);
    return null;
  } catch (error) {
    console.error('Exception while creating secret:', error);
    return null;
  }
};
