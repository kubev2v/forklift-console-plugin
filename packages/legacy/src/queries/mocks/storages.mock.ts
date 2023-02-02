import { ISourceStorage, IAnnotatedStorageClass, IByProvider } from '../types';

export let MOCK_VMWARE_DATASTORES: ISourceStorage[] = [];
export let MOCK_RHV_STORAGE_DOMAINS: ISourceStorage[] = [];
export let MOCK_STORAGE_CLASSES_BY_PROVIDER: IByProvider<IAnnotatedStorageClass> = {};

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_DATASTORES = [
    {
      id: '1',
      name: 'vmware-datastore-1',
      selfLink: '/foo/vmwaredatastore/1',
      path: '/V2V-DC/datastore/datastore-01',
    },
    {
      id: '2',
      name: 'vmware-datastore-2',
      selfLink: '/foo/vmwaredatastore/2',
      path: '/V2V-DC/datastore/datastore-01',
    },
    {
      id: '3',
      name: 'vmware-datastore-3',
      selfLink: '/foo/vmwaredatastore/3',
      path: '/V2V-DC/datastore/datastore-01',
    },
    {
      id: '4',
      name: 'vmware-datastore-4',
      selfLink: '/foo/vmwaredatastore/4',
      path: '/V2V-DC/datastore/datastore-01',
    },
    {
      id: '5',
      name: 'vmware-datastore-5',
      selfLink: '/foo/vmwaredatastore/5',
      path: '/V2V-DC/datastore/datastore-01',
    },
  ];

  MOCK_RHV_STORAGE_DOMAINS = [
    {
      id: '1',
      name: 'rhv-storage-1',
      selfLink: '/foo/rhvstorage/1',
      path: 'Default/V2V-NFS4-Data-01',
    },
    {
      id: '2',
      name: 'rhv-datastore-2',
      selfLink: '/foo/rhvstorage/2',
      path: 'Default/V2V-NFS4-Data-01',
    },
    {
      id: '3',
      name: 'rhv-datastore-3',
      selfLink: '/foo/rhvstorage/3',
      path: 'Default/V2V-NFS4-Data-01',
    },
    {
      id: '4',
      name: 'rhv-datastore-4',
      selfLink: '/foo/rhvstorage/4',
      path: 'Default/V2V-NFS4-Data-01',
    },
    {
      id: '5',
      name: 'rhv-datastore-5',
      selfLink: '/foo/rhvstorage/5',
      path: 'Default/V2V-NFS4-Data-01',
    },
  ];

  const exampleStorageClasses: IAnnotatedStorageClass[] = [
    {
      namespace: 'foo',
      name: 'standard',
      selfLink: '/foo/sc/1',
      uiMeta: {
        isDefault: true,
      },
      object: {
        metadata: {
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
    {
      namespace: 'foo',
      name: 'large',
      selfLink: '/foo/sc/2',
      uiMeta: {
        isDefault: false,
      },
      object: {
        metadata: {},
      },
    },
    {
      namespace: 'foo',
      name: 'small',
      selfLink: '/foo/sc/3',
      uiMeta: {
        isDefault: false,
      },
      object: {
        metadata: {},
      },
    },
  ];

  MOCK_STORAGE_CLASSES_BY_PROVIDER = {
    'ocpv-1': [...exampleStorageClasses],
    'ocpv-2': [...exampleStorageClasses],
    'ocpv-3': [...exampleStorageClasses],
  };
}
