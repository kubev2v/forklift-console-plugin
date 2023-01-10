import Q from 'q';
import KubeClient, {
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
  KubeResource,
  ClusterResource,
  CoreClusterResource,
} from '@migtools/lib-ui';
import { ProviderType, CLUSTER_API_VERSION } from '@app/common/constants';
import { IProviderObject, ISecret } from '@app/queries/types';
import {
  AddProviderFormValues,
  OpenshiftProviderFormValues,
  RHVProviderFormValues,
  VMwareProviderFormValues,
} from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { AuthorizedClusterClient } from './types';
import { nameAndNamespace } from '@app/queries/helpers';

class ForkliftResource extends NamespacedResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: ForkliftResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'forklift.konveyor.io',
      version: 'v1beta1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
  listPath(): string {
    return listPath(this);
  }
  namedPath(name: string): string {
    return namedPath(this, name);
  }
}

class ForkliftAllNamespaceResource extends ClusterResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: ForkliftResourceKind) {
    super();

    this._gvk = {
      group: 'forklift.konveyor.io',
      version: 'v1beta1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
  listPath(): string {
    return listPath(this);
  }
  namedPath(name: string): string {
    return namedPath(this, name);
  }
}

export const createResource = (kind: ForkliftResourceKind, namespace: string): KubeResource =>
  namespace ? new ForkliftResource(kind, namespace) : new ForkliftAllNamespaceResource(kind);

export const createSecretResource = (namespace: string) =>
  namespace
    ? new CoreNamespacedResource(CoreNamespacedResourceKind.Secret, namespace)
    : new CoreClusterResource(CoreNamespacedResourceKind.Secret);

export enum ForkliftResourceKind {
  Provider = 'providers',
  NetworkMap = 'networkmaps',
  StorageMap = 'storagemaps',
  Plan = 'plans',
  Migration = 'migrations',
  Host = 'hosts',
  Hook = 'hooks',
}

export function convertFormValuesToSecret(
  values: AddProviderFormValues,
  createdForResourceType: ForkliftResourceKind,
  providerBeingEdited: IProviderObject | null,
  namespace: string
): ISecret {
  let secretData: ISecret['data'] = {};
  if (values.providerType === 'vsphere') {
    const vmwareValues = values as VMwareProviderFormValues;
    secretData = {
      url: btoa(vmwareHostnameToUrl(vmwareValues.hostname)),
      user: btoa(vmwareValues.username),
      password: btoa(vmwareValues.password),
      thumbprint: btoa(vmwareValues.fingerprint),
    };
  }
  if (values.providerType === 'ovirt') {
    const rhvValues = values as RHVProviderFormValues;
    secretData = {
      url: btoa(ovirtHostnameToUrl(rhvValues.hostname)),
      user: btoa(rhvValues.username),
      password: btoa(rhvValues.password),
      cacert: btoa(rhvValues.caCert),
    };
  }
  if (values.providerType === 'openshift') {
    const openshiftValues = values as OpenshiftProviderFormValues;
    secretData = {
      url: btoa((values as OpenshiftProviderFormValues).url),
      token: btoa(openshiftValues.saToken),
    };
  }
  return {
    apiVersion: 'v1',
    data: secretData,
    kind: 'Secret',
    metadata: {
      ...(!providerBeingEdited
        ? {
            generateName: `${values.name}-`,
            namespace,
          }
        : nameAndNamespace(providerBeingEdited.spec.secret)),
      labels: {
        createdForResourceType,
        createdForResource: values.name,
        createdForProviderType: values.providerType || '',
      },
      ownerReferences: !providerBeingEdited
        ? []
        : [
            {
              apiVersion: CLUSTER_API_VERSION,
              kind: 'Provider',
              name: providerBeingEdited.metadata.name,
              namespace: providerBeingEdited.metadata.namespace,
              uid: providerBeingEdited.metadata.uid,
            },
          ],
    },
    type: 'Opaque',
  };
}

export const vmwareUrlToHostname = (url: string): string => {
  const match = url.match(/^https:\/\/(.+)\/sdk$/);
  return match ? match[1] : url;
};
export const vmwareHostnameToUrl = (hostname: string): string => `https://${hostname}/sdk`;

export const ovirtUrlToHostname = (url: string): string => {
  const match = url.match(/^https:\/\/(.+)\/ovirt-engine\/api$/);
  return match ? match[1] : url;
};
export const ovirtHostnameToUrl = (hostname: string): string =>
  `https://${hostname}/ovirt-engine/api`;

export const convertFormValuesToProvider = (
  namespace: string,
  values: AddProviderFormValues,
  providerType: ProviderType | null
): IProviderObject => {
  const name = values.name;
  let url = '';
  const specSettings: IProviderObject['spec']['settings'] = {};
  if (providerType === 'vsphere') {
    url = vmwareHostnameToUrl((values as VMwareProviderFormValues).hostname);
    specSettings.vddkInitImage = (values as VMwareProviderFormValues).vddkInitImage;
  }
  if (providerType === 'ovirt') {
    url = ovirtHostnameToUrl((values as RHVProviderFormValues).hostname);
  }
  if (providerType === 'openshift') {
    url = (values as OpenshiftProviderFormValues).url;
  }
  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Provider',
    metadata: {
      name,
      namespace,
    },
    spec: {
      type: values.providerType,
      url,
      ...(Object.keys(specSettings).length > 0 ? { settings: specSettings } : {}),
    },
  };
};

export const getTokenSecretLabelSelector = (
  createdForResourceType: string,
  createdForResource: string
): { labelSelector: string } => {
  return {
    labelSelector: `createdForResourceType=${createdForResourceType},createdForResource=${createdForResource}`,
  };
};

export const checkIfResourceExists = async (
  client: AuthorizedClusterClient,
  resourceKind: ForkliftResourceKind,
  resource: KubeResource,
  resourceName: string
): Promise<void> => {
  const secretResource = createSecretResource(
    resource instanceof NamespacedResource ? resource.namespace : undefined
  );
  const results = await Q.allSettled([
    client.list(secretResource, getTokenSecretLabelSelector(resourceKind, resourceName)),
    client.get(resource, resourceName),
  ]);
  const alreadyExists = Object.keys(results).reduce(
    (exists: { kind: string; name: string }[], result) => {
      return results[result]?.status === 'fulfilled ' && results[result]?.value.status === 200
        ? [
            ...exists,
            {
              kind: results[result].value.data.kind,
              name:
                results[result].value.data.items && results[result].value.data.items.length > 0
                  ? results[result].value.data.items[0].metadata.name
                  : results[result].value.data.metadata.name,
            },
          ]
        : exists;
    },
    []
  );
  if (alreadyExists.length > 0) {
    console.error(`Resource already exists: ${resourceKind}/${resourceName}`);
    throw new Error(
      alreadyExists.reduce((msg, v) => {
        return `${msg} - kind: "${v.kind}", name: "${v.name}"`;
      }, 'Some cluster objects already exist ')
    );
  }
};

/** Translate resource into namespaced k8s api ptch */
export const listPath = (resource: KubeResource) => {
  const isCRD = !!resource.gvk().group;
  if (resource instanceof NamespacedResource) {
    return isCRD
      ? [
          '/api/kubernetes/apis',
          resource.gvk().group,
          resource.gvk().version,
          'namespaces',
          resource.namespace,
          resource.gvk().kindPlural,
        ].join('/')
      : [
          '/api/kubernetes/api',
          resource.gvk().version,
          'namespaces',
          resource.namespace,
          resource.gvk().kindPlural,
        ].join('/');
  } else {
    return [
      '/api/kubernetes/apis',
      resource.gvk().group,
      resource.gvk().version,
      resource.gvk().kindPlural,
    ].join('/');
  }
};

/** Translate resource into named k8s api path */
export const namedPath = (resource: KubeResource, name: string) => {
  return [listPath(resource), name].join('/');
};
