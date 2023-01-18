import { KubeResource } from '@migtools/lib-ui';
import { IKubeResponse, IKubeStatus } from '@app/client/types';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { listPath, namedPath } from '@app/client/helpers';

/** Simulate an axios fetch call */
const authorizedK8sRequest = async <T>({
  method = 'GET',
  url,
  data,
  options = {},
}: {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  url: string;
  data?: object;
  options?: object;
}): Promise<IKubeResponse<T>> => {
  const headers =
    method === 'PATCH' && data
      ? { 'Content-Type': 'application/merge-patch+json', Accept: 'application/json' }
      : { 'Content-Type': 'application/json', Accept: 'application/json' };
  const body = method !== 'GET' && data ? JSON.stringify(data) : undefined;

  const requestOptions = {
    ...options,
    method: method,
    headers: headers,
    body: body,
  };

  const response = await consoleFetch(url, requestOptions);
  const resData = await response.json();

  if (response.ok) {
    return {
      data: resData,
      status: response.status,
      statusText: response.statusText,
      config: requestOptions,
      headers: headers,
      request: null,
    };
  } else {
    return Promise.reject(response.statusText);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAuthorizedK8sClient = () => {
  /* eslint-disable @typescript-eslint/ban-types */
  return {
    get: <T>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>({
        method: 'GET',
        url: namedPath(resource, name),
        data: params,
      }),
    list: <T>(resource: KubeResource, params?: object) =>
      authorizedK8sRequest<T>({ method: 'GET', url: listPath(resource), data: params }),
    create: <T>(resource: KubeResource, newObject: object, params?: object) =>
      authorizedK8sRequest<T>({
        method: 'POST',
        url: listPath(resource),
        data: newObject,
        options: params,
      }),
    delete: <T = IKubeStatus>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>({
        method: 'DELETE',
        url: namedPath(resource, name),
        options: params,
      }),
    patch: <T>(resource: KubeResource, name: string, patch: object, params?: object) =>
      authorizedK8sRequest<T>({
        method: 'PATCH',
        url: namedPath(resource, name),
        data: patch,
        options: params,
      }),
    put: <T>(resource: KubeResource, name: string, object: object, params?: object) =>
      authorizedK8sRequest<T>({
        method: 'PUT',
        url: namedPath(resource, name),
        data: object,
        options: params,
      }),
  };
  /* eslint-enable @typescript-eslint/ban-types */
};

export type AuthorizedClusterClient = ReturnType<typeof useAuthorizedK8sClient>;
