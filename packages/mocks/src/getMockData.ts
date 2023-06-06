import { Har } from 'har-format';
import { findHarEntry } from 'harproxyserver';

import * as migrationsK8s from './data/migrations.K8s.json';
import * as networkmapsK8s from './data/networkmaps.K8s.json';
import * as plansK8s from './data/plans.K8s.json';
import * as providersInventory from './data/providers.Inventory.json';
import * as providersK8s from './data/providers.K8s.json';
import * as _har from './data/recorder-brq2.har';
import * as storagemapsK8s from './data/storagemaps.K8s.json';
import { resolvePath } from './definitions/resolvePath';

const har = _har as unknown as Har;

/**
 * List of prefixes used by mockable data sources.
 * Format for data source name is:
 * 1. type:dataSet i.e. "code:basic" OR
 * 2. type i.e. "json"
 */
export const MSW_MOCK_SOURCES = ['har', 'json', 'code'];

export const isDataSourceMock = (dataSource) =>
  MSW_MOCK_SOURCES.some(
    (mockSource) => mockSource === dataSource || mockSource === dataSource?.split(':')?.[0],
  );

/**
 * A mapping of API paths to their corresponding mock data.
 */
const mockData: Record<string, object> = {
  '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers': providersInventory,
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/providers':
    providersK8s,
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/migrations':
    migrationsK8s,
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans': plansK8s,
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps':
    networkmapsK8s,
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps':
    storagemapsK8s,
};

/**
 * Get a mock response for a given request and path parameters.
 *
 * @param {Object} param0 - The object containing the request parameters
 * @param {string} param0.pathname - The incoming request pathname to match against the mock handlers
 * @param {string} [param0.method] - An optional string, the incoming request method to match against the mock handlers
 * @param {PathParams} [param0.params] - An optional object containing the path parameters of the request
 * @param {string} [source] - The type of data source ('json' or 'har'). Defaults to 'json'.
 * @returns {MockResponse | null} A mock response or null if no mock handler is found
 */
export const getMockData = (
  { pathname }: MockDataRequestParameters,
  source = 'json',
): MockResponse | null => {
  // Check path is mockable, Mock only REST API paths
  if (
    !isDataSourceMock(source) ||
    !pathname ||
    !(pathname.startsWith('/api/kubernetes') || pathname.startsWith('/api/proxy'))
  ) {
    return null;
  }

  // Dynamic handlers, using custom logic.

  // Add your mock handlers here, e.g.:
  // if (method === 'GET' && pathname === '/api/some-resource' && params['details'] === '1') {
  //   return mockResponse;
  // }

  // Static handlers, using mockData.
  const data = getStaticData(pathname, source);

  if (data) {
    return {
      statusCode: 200,
      body: data,
    };
  }

  return null;
};

/**
 * Replaces a namespace string in a Kubernetes path.
 * Static paths for 'json' and 'har' data sources may have been recorded on a different namespace.
 * @param {string} path - The original Kubernetes path.
 * @param {string} newNamespace - The replacement namespace.
 * @returns {string} The modified path with the new namespace.
 */
export function replaceNamespaceInPath(path: string, newNamespace: string): string {
  const namespaceRegex = /\/namespaces\/[^/]+\//g;
  return path.replace(namespaceRegex, `/namespaces/${newNamespace}/`);
}

/**
 * Retrieves data from a specific static data source.
 * @param {string} pathname - The path to the data.
 * @param {string} source - The type of data source ('json' or 'har').
 * @returns {object | null} The retrieved data as an object, or null if not found.
 */
function getStaticData(pathname: string, source: string): object | null {
  const [type, dataSet] = source?.split(':') ?? [];
  switch (type) {
    case 'json':
      return mockData[replaceNamespaceInPath(pathname, 'openshift-mtv')];
    case 'har':
      // eslint-disable-next-line no-case-declarations
      const recordedEntry = findHarEntry(
        har.log,
        'GET',
        replaceNamespaceInPath(pathname, 'openshift-mtv'),
        undefined,
        true,
      );
      // eslint-disable-next-line no-case-declarations
      const text = recordedEntry?.response?.content?.text;

      return text && JSON.parse(text);
    case 'code':
      return resolvePath(pathname, dataSet);
  }

  return null;
}

/**
 * Interface representing a mock response.
 *
 * @property statusCode - The HTTP status code of the mock response
 * @property body - The response body as object
 */
export interface MockResponse {
  statusCode: number;
  body: object | null;
}

/**
 * Interface for the parameters of the getMockData function.
 *
 * @property {string} pathname - The pathname of the incoming request to match against the mock handlers
 * @property {string} [method] - An optional method of the incoming request to match against the mock handlers
 * @property {Record<string, string | ReadonlyArray<string>>} [params] - An optional object containing the path parameters of the request
 */
export interface MockDataRequestParameters {
  pathname: string;
  method?: string;
  params?: Record<string, string | ReadonlyArray<string>>;
}
