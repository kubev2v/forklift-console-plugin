import type {
  V1beta1ForkliftController,
  V1beta1Plan,
  V1beta1Provider,
  V1VirtualMachine,
} from '@forklift-ui/types';
import type { Page } from '@playwright/test';

import { BaseResourceManager } from './BaseResourceManager';
import { API_PATHS, MTV_NAMESPACE, OPERATOR_CSV_PREFIXES, RESOURCE_KINDS } from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles fetching resources from Kubernetes APIs
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceFetcher extends BaseResourceManager {
  static async fetchForkliftController(
    page: Page,
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourceFetcher.fetchResource<V1beta1ForkliftController>(page, {
      kind: RESOURCE_KINDS.FORKLIFT_CONTROLLER,
      resourceName: controllerName,
      namespace,
    });
  }

  /**
   * Fetches the MTV/Forklift operator version from the cluster by reading the
   * ClusterServiceVersion (CSV) resource created by OLM.
   *
   * Looks for a CSV whose name starts with "mtv-operator" (downstream) or
   * "forklift-operator" (upstream) and returns its spec.version.
   *
   * @returns The semver version string (e.g. "2.7.0") or null if not found.
   */
  static async fetchMtvVersion(page: Page, namespace = MTV_NAMESPACE): Promise<string | null> {
    type CsvItem = { metadata?: { name?: string }; spec?: { version?: string } };
    type CsvList = { items?: CsvItem[] };

    const apiPath = `${API_PATHS.OLM_CSV}/namespaces/${namespace}/clusterserviceversions`;
    const data = await ResourceFetcher.apiGet<CsvList>(page, apiPath);

    if (!data?.items) {
      return null;
    }

    const operatorCsv = data.items.find((csv) =>
      OPERATOR_CSV_PREFIXES.some((prefix) => csv.metadata?.name?.startsWith(prefix)),
    );

    if (!operatorCsv?.spec?.version) {
      console.error('Operator CSV not found among cluster service versions');
      return null;
    }

    return operatorCsv.spec.version;
  }

  static async fetchPlan(
    page: Page,
    planName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Plan | null> {
    return ResourceFetcher.fetchResource<V1beta1Plan>(page, {
      kind: RESOURCE_KINDS.PLAN,
      resourceName: planName,
      namespace,
    });
  }

  static async fetchProvider(
    page: Page,
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourceFetcher.fetchResource<V1beta1Provider>(page, {
      kind: RESOURCE_KINDS.PROVIDER,
      resourceName: providerName,
      namespace,
    });
  }

  static async fetchResource<T extends SupportedResource>(
    page: Page,
    options: { kind: string; resourceName: string; namespace: string },
  ): Promise<T | null> {
    const { kind, namespace, resourceName } = options;
    const resourceType = ResourceFetcher.getResourceTypeFromKind(kind);

    const basePath =
      kind === RESOURCE_KINDS.VIRTUAL_MACHINE ? API_PATHS.KUBEVIRT : API_PATHS.FORKLIFT;
    const apiPath = `${basePath}/namespaces/${namespace}/${resourceType}/${resourceName}`;

    return ResourceFetcher.apiGet<T>(page, apiPath);
  }

  static async fetchVirtualMachine(
    page: Page,
    vmName: string,
    namespace: string,
  ): Promise<V1VirtualMachine | null> {
    return ResourceFetcher.fetchResource<V1VirtualMachine>(page, {
      kind: RESOURCE_KINDS.VIRTUAL_MACHINE,
      resourceName: vmName,
      namespace,
    });
  }
}
