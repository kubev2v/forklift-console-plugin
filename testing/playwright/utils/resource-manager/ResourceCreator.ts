import type { IoK8sApiCoreV1Secret, V1beta1NetworkMap, V1beta1Provider } from '@kubev2v/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { MTV_NAMESPACE, NAD_API_VERSION, RESOURCE_KINDS } from './constants';

/**
 * NetworkAttachmentDefinition type for CNI network configuration
 */
export type V1NetworkAttachmentDefinition = {
  apiVersion: 'k8s.cni.cncf.io/v1';
  kind: 'NetworkAttachmentDefinition';
  metadata: {
    name: string;
    namespace: string;
    annotations?: Record<string, string>;
  };
  spec: {
    config: string;
  };
};

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
            const cookieList = document.cookie.split('; ');
            const tokenCookie = cookieList.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            return tokenCookie ? tokenCookie.split('=')[1] : '';
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

export const createNetworkMap = async (
  page: Page,
  networkMap: V1beta1NetworkMap,
  namespace = MTV_NAMESPACE,
): Promise<V1beta1NetworkMap | null> => {
  try {
    const constants = BaseResourceManager.getEvaluateConstants();
    const result = await page.evaluate(
      async ({ networkMapData, ns, evalConstants }) => {
        try {
          const getCsrfTokenFromCookie = () => {
            const cookieList = document.cookie.split('; ');
            const tokenCookie = cookieList.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            return tokenCookie ? tokenCookie.split('=')[1] : '';
          };
          const csrfToken = getCsrfTokenFromCookie();

          const apiPath = `${evalConstants.FORKLIFT_PATH}/namespaces/${ns}/networkmaps`;

          const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(networkMapData),
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
        networkMapData: networkMap,
        ns: namespace,
        evalConstants: constants,
      },
    );

    if (result.success && result.data) {
      return result.data as V1beta1NetworkMap;
    }

    console.error(`Failed to create network map: ${result.error}`);
    return null;
  } catch (error) {
    console.error('Exception while creating network map:', error);
    return null;
  }
};

export const createNad = async (
  page: Page,
  nad: V1NetworkAttachmentDefinition,
  namespace: string,
): Promise<V1NetworkAttachmentDefinition | null> => {
  try {
    const constants = BaseResourceManager.getEvaluateConstants();
    const result = await page.evaluate(
      async ({ nadData, ns, evalConstants }) => {
        try {
          const getCsrfTokenFromCookie = () => {
            const cookieList = document.cookie.split('; ');
            const tokenCookie = cookieList.find((cookie) =>
              cookie.startsWith(`${evalConstants.CSRF_TOKEN_NAME}=`),
            );
            return tokenCookie ? tokenCookie.split('=')[1] : '';
          };
          const csrfToken = getCsrfTokenFromCookie();

          const apiPath = `${evalConstants.NAD_PATH}/namespaces/${ns}/network-attachment-definitions`;

          const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
              [evalConstants.CONTENT_TYPE_HEADER]: evalConstants.APPLICATION_JSON,
              [evalConstants.CSRF_TOKEN_HEADER]: csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify(nadData),
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
        nadData: nad,
        ns: namespace,
        evalConstants: constants,
      },
    );

    if (result.success && result.data) {
      return result.data as V1NetworkAttachmentDefinition;
    }

    console.error(`Failed to create NAD: ${result.error}`);
    return null;
  } catch (error) {
    console.error('Exception while creating NAD:', error);
    return null;
  }
};
