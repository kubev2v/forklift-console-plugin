import { INetworkContext, useNetworkContext } from '@app/common/context/NetworkContext';
import { QueryFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';
import { History, LocationState } from 'history';
import { useClientInstance } from '@app/client/helpers';
import { KubeResource } from '@migtools/lib-ui';
import { IKubeResponse, IKubeStatus } from '@app/client/types';
import { ENV } from '@app/common/constants';

interface IFetchContext {
  history: History<LocationState>;
  checkExpiry: INetworkContext['checkExpiry'];
  currentUser: INetworkContext['currentUser'];
}

export const useFetchContext = (): IFetchContext => {
  const { checkExpiry, currentUser } = useNetworkContext();
  return { history: useHistory(), checkExpiry, currentUser };
};

export const authorizedFetch = async <TResponse, TData = unknown>(
  url: string,
  fetchContext: IFetchContext,
  extraHeaders: RequestInit['headers'] = {},
  method: 'get' | 'post' = 'get',
  returnMode: 'json' | 'blob' = 'json',
  bypassRedirect = false,
  data?: TData
): Promise<TResponse> => {
  const { history, checkExpiry } = fetchContext;

  if (ENV.AUTH_REQUIRED !== 'false' && fetchContext.currentUser?.access_token) {
    extraHeaders['Authorization'] = `Bearer ${fetchContext.currentUser.access_token}`;
  }

  try {
    const response = await fetch(url, {
      headers: extraHeaders,
      method,
      ...(data &&
        method !== 'get' && {
          body: JSON.stringify(data),
        }),
    });
    if (response.ok && response.json) {
      return returnMode === 'json' ? response.json() : response.blob();
    } else {
      throw response;
    }
  } catch (error: unknown) {
    !bypassRedirect && checkExpiry(error, history);
    throw error;
  }
};

export const useAuthorizedFetch = <T>(url: string, bypassRedirect?: boolean): QueryFunction<T> => {
  const fetchContext = useFetchContext();
  return () => authorizedFetch(url, fetchContext, {}, 'get', 'json', bypassRedirect);
};

export const authorizedK8sRequest = async <T>(
  fetchContext: IFetchContext,
  requestFn: () => Promise<IKubeResponse<T>>
): Promise<IKubeResponse<T>> => {
  const { history, checkExpiry } = fetchContext;

  try {
    const response = await requestFn();
    if (response && response.data) {
      return response;
    } else {
      throw response;
    }
  } catch (error: unknown) {
    checkExpiry(error, history);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAuthorizedK8sClient = () => {
  const fetchContext = useFetchContext();
  const client = useClientInstance();
  /* eslint-disable @typescript-eslint/ban-types */
  return {
    get: <T>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.get(resource, name, params)),
    list: <T>(resource: KubeResource, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.list(resource, params)),
    create: <T>(resource: KubeResource, newObject: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.create(resource, newObject, params)),
    delete: <T = IKubeStatus>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.delete(resource, name, params)),
    patch: <T>(resource: KubeResource, name: string, patch: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.patch(resource, name, patch, params)),
    put: <T>(resource: KubeResource, name: string, object: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.put(resource, name, object, params)),
  };
  /* eslint-enable @typescript-eslint/ban-types */
};

export type AuthorizedClusterClient = ReturnType<typeof useAuthorizedK8sClient>;
