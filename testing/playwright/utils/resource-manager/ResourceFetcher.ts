import type {
  V1beta1ForkliftController,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
  V1VirtualMachine,
} from '@forklift-ui/types';

import { BaseResourceManager } from './BaseResourceManager';
import {
  API_PATHS,
  CNV_NAMESPACE,
  CNV_OPERATOR_CSV_PREFIXES,
  MTV_NAMESPACE,
  OPERATOR_CSV_PREFIXES,
  RESOURCE_KINDS,
} from './constants';
import type { SupportedResource } from './ResourceManager';

/**
 * Handles fetching resources from Kubernetes APIs.
 * All operations use Node.js HTTP directly — no browser Page required.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ResourceFetcher extends BaseResourceManager {
  static async fetchCnvVersion(namespace = CNV_NAMESPACE): Promise<string | null> {
    return ResourceFetcher.fetchOperatorVersion(
      namespace,
      CNV_OPERATOR_CSV_PREFIXES,
      'CNV operator',
    );
  }

  static async fetchForkliftController(
    controllerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1ForkliftController | null> {
    return ResourceFetcher.fetchResource<V1beta1ForkliftController>({
      kind: RESOURCE_KINDS.FORKLIFT_CONTROLLER,
      resourceName: controllerName,
      namespace,
    });
  }

  static async fetchMtvVersion(namespace = MTV_NAMESPACE): Promise<string | null> {
    return ResourceFetcher.fetchOperatorVersion(namespace, OPERATOR_CSV_PREFIXES, 'Operator');
  }

  static async fetchNetworkMap(
    networkMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1NetworkMap | null> {
    return ResourceFetcher.fetchResource<V1beta1NetworkMap>({
      kind: RESOURCE_KINDS.NETWORK_MAP,
      resourceName: networkMapName,
      namespace,
    });
  }

  private static async fetchOperatorVersion(
    namespace: string,
    prefixes: readonly string[],
    operatorLabel: string,
  ): Promise<string | null> {
    type CsvItem = { metadata?: { name?: string }; spec?: { version?: string } };
    type CsvList = { items?: CsvItem[] };

    const apiPath = `${API_PATHS.OLM_CSV}/namespaces/${namespace}/clusterserviceversions`;
    const data = await ResourceFetcher.apiGet<CsvList>(apiPath);

    if (!data?.items) return null;

    const csv = data.items.find((item) =>
      prefixes.some((prefix) => item.metadata?.name?.startsWith(prefix)),
    );

    if (!csv?.spec?.version) {
      console.error(`${operatorLabel} CSV not found among cluster service versions`);
      return null;
    }

    return csv.spec.version;
  }

  static async fetchPlan(planName: string, namespace = MTV_NAMESPACE): Promise<V1beta1Plan | null> {
    return ResourceFetcher.fetchResource<V1beta1Plan>({
      kind: RESOURCE_KINDS.PLAN,
      resourceName: planName,
      namespace,
    });
  }

  static async fetchProvider(
    providerName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1Provider | null> {
    return ResourceFetcher.fetchResource<V1beta1Provider>({
      kind: RESOURCE_KINDS.PROVIDER,
      resourceName: providerName,
      namespace,
    });
  }

  static async fetchResource<T extends SupportedResource>(options: {
    kind: string;
    resourceName: string;
    namespace: string;
  }): Promise<T | null> {
    const { kind, namespace, resourceName } = options;
    const resourceType = ResourceFetcher.getResourceTypeFromKind(kind);

    const basePath =
      kind === RESOURCE_KINDS.VIRTUAL_MACHINE ? API_PATHS.KUBEVIRT : API_PATHS.FORKLIFT;
    const apiPath = `${basePath}/namespaces/${namespace}/${resourceType}/${resourceName}`;

    return ResourceFetcher.apiGet<T>(apiPath);
  }

  static async fetchStorageMap(
    storageMapName: string,
    namespace = MTV_NAMESPACE,
  ): Promise<V1beta1StorageMap | null> {
    return ResourceFetcher.fetchResource<V1beta1StorageMap>({
      kind: RESOURCE_KINDS.STORAGE_MAP,
      resourceName: storageMapName,
      namespace,
    });
  }

  static async fetchVirtualMachine(
    vmName: string,
    namespace: string,
  ): Promise<V1VirtualMachine | null> {
    return ResourceFetcher.fetchResource<V1VirtualMachine>({
      kind: RESOURCE_KINDS.VIRTUAL_MACHINE,
      resourceName: vmName,
      namespace,
    });
  }
}
