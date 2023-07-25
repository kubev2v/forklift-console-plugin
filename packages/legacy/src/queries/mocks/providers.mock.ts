import {
  IVMwareProvider,
  IOpenShiftProvider,
  IProvidersByType,
  IProviderObject,
  IRHVProvider,
  IOpenStackProvider,
} from '../types/providers.types';

export let MOCK_INVENTORY_PROVIDERS: IProvidersByType = {
  vsphere: [],
  ovirt: [],
  openstack: [],
  openshift: [],
  ova: [],
};

export let MOCK_CLUSTER_PROVIDERS: IProviderObject[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const providerStatusReadyFields: IProviderObject = {
    status: {
      conditions: [
        {
          category: 'Required',
          lastTransitionTime: '2021-03-18T21:01:10Z',
          message: 'Connection test, succeeded.',
          reason: 'Tested',
          status: 'True',
          type: 'ConnectionTestSucceeded',
        },
        {
          category: 'Advisory',
          lastTransitionTime: '2021-02-08T19:36:55Z',
          message: 'Validation has been completed.',
          reason: 'Completed',
          status: 'True',
          type: 'Validated',
        },
        {
          category: 'Required',
          lastTransitionTime: '2021-03-23T16:58:23Z',
          message: 'The inventory has been loaded.',
          reason: 'Completed',
          status: 'True',
          type: 'InventoryCreated',
        },
        {
          category: 'Required',
          lastTransitionTime: '2021-03-23T16:58:23Z',
          message: 'The provider is ready.',
          status: 'True',
          type: 'Ready',
        },
      ],
      phase: 'Ready',
    },
    metadata: undefined,
    spec: {
      type: 'vsphere',
      url: '',
      secret: undefined,
      settings: {
        vddkInitImage: '',
      },
    },
    apiVersion: '',
    kind: '',
  };

  const vmwareProvider1: IVMwareProvider = {
    uid: 'mock-uid-vcenter-1',
    namespace: 'openshift-migration',
    name: 'vcenter-1',
    selfLink: '/foo/vmwareprovider/1',
    type: 'vsphere',
    object: {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Provider',
      metadata: {
        name: 'vcenter-1',
        namespace: 'openshift-migration',
        selfLink: '/foo/bar',
        uid: 'mock-uid-vcenter-1',
        creationTimestamp: '2020-08-21T18:36:41.468Z',
      },
      spec: {
        type: 'vsphere',
        url: 'https://vcenter.v2v.bos.redhat.com/sdk',
        secret: {
          namespace: 'openshift-migration',
          name: 'boston',
        },
        settings: {
          vddkInitImage: 'quay.io/username/vddk',
        },
      },
      status: {
        ...providerStatusReadyFields.status,
      },
    },
    clusterCount: 2,
    hostCount: 2,
    vmCount: 41,
    networkCount: 8,
    datastoreCount: 3,
    storageClassCount: 0, // TODO need to remove when refactoring
  };

  const vmwareProvider2: IVMwareProvider = {
    ...vmwareProvider1,
    uid: 'mock-uid-vcenter-2',
    name: 'vcenter-2',
    selfLink: '/foo/vmwareprovider/2',
    object: {
      ...vmwareProvider1.object,
      metadata: {
        ...vmwareProvider1.object.metadata,
        name: 'vcenter-2',
        uid: 'mock-uid-vcenter-2',
        creationTimestamp: '2020-08-22T18:36:41.468Z',
      },
      status: {
        conditions: [
          {
            type: 'URLNotValid',
            status: 'True',
            category: 'Critical',
            message: 'The provider is not responding.',
            lastTransitionTime: '2020-08-21T18:36:41.468Z',
            reason: '',
          },
        ],
        phase: 'ConnectionFailed',
      },
    },
  };

  const vmwareProvider3: IVMwareProvider = {
    ...vmwareProvider1,
    uid: 'mock-uid-vcenter-3',
    name: 'vcenter-3',
    selfLink: '/foo/vmwareprovider/3',
    object: {
      ...vmwareProvider1.object,
      metadata: {
        ...vmwareProvider1.object.metadata,
        name: 'vcenter-3',
        uid: 'mock-uid-vcenter-3',
        creationTimestamp: '2020-08-23T18:36:41.468Z',
      },
      status: {
        conditions: [
          {
            category: 'Required',
            lastTransitionTime: '2021-03-18T21:01:10Z',
            message: 'Connection test, succeeded.',
            reason: 'Tested',
            status: 'True',
            type: 'ConnectionTestSucceeded',
          },
          {
            category: 'Advisory',
            lastTransitionTime: '2021-02-08T19:36:55Z',
            message: 'Validation has been completed.',
            reason: 'Completed',
            status: 'True',
            type: 'Validated',
          },
          {
            category: 'Advisory',
            lastTransitionTime: '2021-03-23T16:58:23Z',
            message: 'Loading the inventory.',
            reason: 'Started',
            status: 'True',
            type: 'LoadInventory',
          },
        ],
        phase: 'Staging',
      },
    },
  };

  const rhvProvider1: IRHVProvider = {
    uid: 'mock-uid-rhv-1',
    namespace: 'konveyor-forklift',
    name: 'rhv-1',
    selfLink: 'providers/ovirt/foo1',
    type: 'ovirt',
    object: {
      kind: 'Provider',
      apiVersion: 'forklift.konveyor.io/v1beta1',
      metadata: {
        name: 'rhv-1',
        namespace: 'konveyor-forklift',
        selfLink:
          '/apis/forklift.konveyor.io/v1beta1/namespaces/konveyor-forklift/providers/rhv-1/status',
        uid: 'mock-uid-rhv-1',
        creationTimestamp: '2021-05-06T13:35:06Z',
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"forklift.konveyor.io/v1beta1","kind":"Provider","metadata":{"annotations":{},"name":"rhv","namespace":"konveyor-forklift"},"spec":{"secret":{"name":"rhv","namespace":"konveyor-forklift"},"type":"ovirt","url":"https://rhvm.v2v.bos.redhat.com/ovirt-engine/api"}}\n',
        },
      },
      spec: {
        type: 'ovirt',
        url: 'https://rhvm.v2v.bos.redhat.com/ovirt-engine/api',
        secret: { namespace: 'konveyor-forklift', name: 'rhv' },
      },
      status: {
        ...providerStatusReadyFields.status,
      },
    },
    datacenterCount: 1,
    clusterCount: 2,
    hostCount: 4,
    vmCount: 36,
    networkCount: 15,
    storageDomainCount: 9,
    datastoreCount: 0,
    storageClassCount: 0, // TODO need to remove when refactoring
  };

  const rhvProvider1i: IRHVProvider = {
    ...rhvProvider1,
    uid: 'mock-uid-rhv-1i',
    name: 'rhv-1-insecure',
    selfLink: 'providers/ovirt/foo1i',
    object: {
      ...rhvProvider1.object,
      metadata: {
        ...rhvProvider1.object.metadata,
        name: 'rhv-1-insecure',
        uid: 'mock-uid-rhv-1i',
      },
      spec: {
        ...rhvProvider1.object.spec,
        secret: { namespace: 'konveyor-forklift', name: 'mock-insecure' },
      },
      // TODO different mocked status?
    },
  };

  const rhvProvider2: IRHVProvider = {
    ...rhvProvider1,
    uid: 'mock-uid-rhv-2',
    name: 'rhv-2',
    selfLink: 'providers/ovirt/foo2',
    object: {
      ...rhvProvider1.object,
      metadata: {
        ...rhvProvider1.object.metadata,
        name: 'rhv-2',
        uid: 'mock-uid-rhv-2',
      },
      // TODO different mocked status?
    },
  };

  const rhvProvider3: IRHVProvider = {
    ...rhvProvider1,
    uid: 'mock-uid-rhv-3',
    name: 'rhv-3',
    selfLink: 'providers/ovirt/foo3',
    object: {
      ...rhvProvider1.object,
      metadata: {
        ...rhvProvider1.object.metadata,
        name: 'rhv-3',
        uid: 'mock-uid-rhv-3',
      },
      // TODO different mocked status?
    },
  };

  const openstackProvider1: IOpenStackProvider = {
    uid: 'mock-uid-openstack-1',
    namespace: 'konveyor-forklift',
    name: 'openstack-insecure-1',
    selfLink: 'providers/openstack/foo1',
    type: 'openstack',
    object: {
      kind: 'Provider',
      apiVersion: 'forklift.konveyor.io/v1beta1',
      metadata: {
        name: 'openstack-insecure-1',
        namespace: 'konveyor-forklift',
        selfLink:
          '/apis/forklift.konveyor.io/v1beta1/namespaces/konveyor-forklift/providers/openstack/status',
        uid: 'mock-uid-openstack-1',
        creationTimestamp: '2023-02-20T11:53:06Z',
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"forklift.konveyor.io/v1beta1","kind":"Provider","metadata":{"annotations":{},"name":"openstack","namespace":"konveyor-forklift"},"spec":{"secret":{"name":"openstack","namespace":"konveyor-forklift"},"type":"openstack","url":"http://v2v.com:5000/v3"}}\n',
        },
      },
      spec: {
        type: 'openstack',
        url: 'http://v2v.com:5000/v3',
        secret: { namespace: 'konveyor-forklift', name: 'insecure' },
      },
      status: {
        ...providerStatusReadyFields.status,
      },
    },
    clusterCount: 0,
    hostCount: 0,
    regionCount: 1,
    projectCount: 1,
    vmCount: 3,
    imageCount: 1,
    volumeCount: 5,
    volumeTypeCount: 2,
    networkCount: 3,
    datastoreCount: 0,
    storageClassCount: 0, // TODO need to remove when refactoring
  };

  const openstackProvider2: IOpenStackProvider = {
    ...openstackProvider1,
    uid: 'mock-uid-openstack-2',
    name: 'openstack-secure-2',
    selfLink: 'providers/openstack/foo2',
    object: {
      ...openstackProvider1.object,
      metadata: {
        ...openstackProvider1.object.metadata,
        name: 'openstack-secure-2',
        uid: 'mock-uid-openstack-2',
      },
      spec: {
        type: 'openstack',
        url: 'http://packstack.com:5000/v3',
        secret: { namespace: 'konveyor-forklift', name: 'secure' },
      },
    },
  };

  const openshiftProvider1: IOpenShiftProvider = {
    uid: 'mock-uid-ocpv-1',
    namespace: 'openshift-migration',
    name: 'ocpv-1',
    selfLink: '/foo/openshiftprovider/1',
    type: 'openshift',
    object: {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Provider',
      metadata: {
        name: 'ocpv-1',
        namespace: 'openshift-migration',
        selfLink: '/foo/bar',
        uid: 'mock-uid-ocpv-1',
        creationTimestamp: '2020-08-21T18:36:41.468Z',
        annotations: {
          'forklift.konveyor.io/defaultTransferNetwork': 'ocp-network-3',
        },
      },
      spec: {
        type: 'openshift',
        url: 'https://my_OCPv_url',
        secret: {
          namespace: 'openshift-migration',
          name: 'boston',
        },
      },
      status: {
        ...providerStatusReadyFields.status,
      },
    },
    vmCount: 26,
    networkCount: 8,
    clusterCount: 0, // TODO need to remove when refactoring since there is no such counter for OpenShift
    hostCount: 0, // TODO need to remove when refactoring since there is no such counter for OpenShift
    storageClassCount: 0, // TODO need to remove when refactoring since there is no such counter for OpenShift
    datastoreCount: 0, // TODO need to remove when refactoring since there is no such counter for OpenShift
  };

  const openshiftProvider2: IOpenShiftProvider = {
    ...openshiftProvider1,
    uid: 'mock-uid-ocpv-2',
    name: 'ocpv-2',
    selfLink: '/foo/openshiftprovider/2',
    object: {
      ...openshiftProvider1.object,
      metadata: {
        ...openshiftProvider1.object.metadata,
        name: 'ocpv-2',
        uid: 'mock-uid-ocpv-2',
      },
      status: {
        conditions: [
          {
            type: 'URLNotValid',
            status: 'True',
            category: 'Critical',
            message: 'The provider is not responding.',
            lastTransitionTime: '2020-08-21T18:36:41.468Z',
            reason: '',
          },
        ],
        phase: 'ConnectionFailed',
      },
    },
  };

  const openshiftProvider3: IOpenShiftProvider = {
    ...openshiftProvider1,
    uid: 'mock-uid-ocpv-3',
    name: 'ocpv-3',
    selfLink: '/foo/openshiftprovider/3',
    object: {
      ...openshiftProvider1.object,
      metadata: {
        ...openshiftProvider1.object.metadata,
        name: 'ocpv-3',
        uid: 'mock-uid-ocpv-3',
      },
      spec: {
        ...openshiftProvider1.object.spec,
        url: '',
      },
    },
  };

  const openshiftProvider4: IOpenShiftProvider = {
    ...openshiftProvider1,
    uid: 'mock-uid-host',
    name: 'host',
    selfLink: '/foo/openshiftprovider/3',
    object: {
      ...openshiftProvider1.object,
      metadata: {
        ...openshiftProvider1.object.metadata,
        name: 'host',
        uid: 'mock-uid-host',
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'ForkliftController',
            name: 'forklift-controller',
            namespace: 'openshift-migration',
            uid: '2d0a80a3-94a7-4fe5-b0cb-225cf5e24eac',
          },
        ],
      },
      spec: {
        ...openshiftProvider1.object.spec,
        url: '',
      },
    },
  };

  MOCK_INVENTORY_PROVIDERS = {
    vsphere: [vmwareProvider1, vmwareProvider2, vmwareProvider3],
    ovirt: [rhvProvider1, rhvProvider1i, rhvProvider2, rhvProvider3],
    openstack: [openstackProvider1, openstackProvider2],
    openshift: [openshiftProvider1, openshiftProvider2, openshiftProvider3, openshiftProvider4],
    ova: [],
  };

  MOCK_CLUSTER_PROVIDERS = [
    ...MOCK_INVENTORY_PROVIDERS.vsphere,
    ...MOCK_INVENTORY_PROVIDERS.ovirt,
    ...MOCK_INVENTORY_PROVIDERS.openstack,
    ...MOCK_INVENTORY_PROVIDERS.openshift,
  ].map((inventoryProvider) => ({ ...inventoryProvider.object }));
}
