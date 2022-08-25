import Q from 'q';
import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
} from '@migtools/lib-ui';
import { META, ProviderType, CLUSTER_API_VERSION } from '@app/common/constants';
import { IProviderObject, ISecret } from '@app/queries/types';
import { useNetworkContext } from '@app/common/context';
import {
  AddProviderFormValues,
  OpenshiftProviderFormValues,
  RHVProviderFormValues,
  VMwareProviderFormValues,
} from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { AuthorizedClusterClient } from './types';
import { nameAndNamespace } from '@app/queries/helpers';

export class ForkliftResource extends NamespacedResource {
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
}
export enum ForkliftResourceKind {
  Provider = 'providers',
  NetworkMap = 'networkmaps',
  StorageMap = 'storagemaps',
  Plan = 'plans',
  Migration = 'migrations',
  Host = 'hosts',
  Hook = 'hooks',
}

export const secretResource = new CoreNamespacedResource(
  CoreNamespacedResourceKind.Secret,
  META.namespace
  //are we moving the secrets to the config namespace?
);

export const providerResource = new ForkliftResource(ForkliftResourceKind.Provider, META.namespace);

export function convertFormValuesToSecret(
  values: AddProviderFormValues,
  createdForResourceType: ForkliftResourceKind,
  providerBeingEdited: IProviderObject | null
): ISecret {
  let secretData: ISecret['data'] = {};
  if (values.providerType === 'vsphere') {
    const vmwareValues = values as VMwareProviderFormValues;
    secretData = {
      user: btoa(vmwareValues.username),
      password: btoa(vmwareValues.password),
      thumbprint: btoa(vmwareValues.fingerprint),
    };
  }
  if (values.providerType === 'ovirt') {
    const rhvValues = values as RHVProviderFormValues;
    secretData = {
      user: btoa(rhvValues.username),
      password: btoa(rhvValues.password),
      cacert: btoa(rhvValues.caCert),
    };
  }
  if (values.providerType === 'openshift') {
    const openshiftValues = values as OpenshiftProviderFormValues;
    secretData = {
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
            namespace: META.namespace,
          }
        : nameAndNamespace(providerBeingEdited.spec.secret)),
      labels: {
        createdForResourceType,
        createdForResource: values.name,
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
      namespace: META.namespace,
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
  resourceKind: ForkliftResourceKind | CoreNamespacedResourceKind,
  resource: ForkliftResource,
  resourceName: string
): Promise<void> => {
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

export const useClientInstance = (): KubeClient.ClusterClient => {
  const { currentUser } = useNetworkContext();
  const user = {
    access_token: currentUser?.access_token || '',
    expiry_time: currentUser?.expiry_time || 0,
  };
  return ClientFactory.cluster(user, '/cluster-api');
};
