/* eslint-disable @cspell/spellchecker */
import {
  OpenShiftStorageClass,
  OpenstackVolumeType,
  OVirtStorageDomain,
  VSphereDataStore,
} from '@kubev2v/types';

import { EPOCH } from '../utils';

import {
  OPENSHIFT_01_UID,
  OPENSHIFT_02_UID,
  OPENSHIFT_03_UID,
  OPENSHIFT_HOST_UID,
  OpenshiftProviderIDs,
  OPENSTACK_01_UID,
  OPENSTACK_02_UID,
  OpenstackProviderIDs,
  OVIRT_01_UID,
  OVIRT_02_UID,
  OVIRT_03_UID,
  OVIRT_INSECURE_UID,
  OvirtProviderIDs,
  VMWARE_01_UID,
  VMWARE_02_UID,
  VMWARE_03_UID,
  VmwareProviderIDs,
} from './providers.mock';

export const MOCK_VMWARE_DATASTORES: { [uid in VmwareProviderIDs]: VSphereDataStore[] } = {
  [VMWARE_01_UID]: [
    {
      id: '1',
      name: 'vmware-datastore-1',
      selfLink: `providers/vsphere/${VMWARE_01_UID}/datastores/1`,
      path: '/V2V-DC/datastore/datastore-01',
      revision: 1,
      parent: {
        kind: 'parent-test-kind',
        id: 'parent-id',
      },
      type: '',
      capacity: 0,
      free: 0,
      maintenance: '',
    },
    {
      id: '2',
      name: 'vmware-datastore-2',
      selfLink: `providers/vsphere/${VMWARE_01_UID}/datastores/2`,
      path: '/V2V-DC/datastore/datastore-01',
      revision: 1,
      parent: {
        kind: 'parent-test-kind',
        id: 'parent-id',
      },
      type: '',
      capacity: 0,
      free: 0,
      maintenance: '',
    },
  ],
  [VMWARE_02_UID]: [
    {
      id: '3',
      name: 'vmware-datastore-3',
      selfLink: `providers/vsphere/${VMWARE_02_UID}/datastores/3`,
      path: '/V2V-DC/datastore/datastore-01',
      revision: 1,
      parent: {
        kind: 'parent-test-kind',
        id: 'parent-id',
      },
      type: '',
      capacity: 0,
      free: 0,
      maintenance: '',
    },
  ],
  [VMWARE_03_UID]: [
    {
      id: '4',
      name: 'vmware-datastore-4',
      selfLink: `providers/vsphere/${VMWARE_03_UID}/datastores/4`,
      path: '/V2V-DC/datastore/datastore-01',
      revision: 1,
      parent: {
        kind: 'parent-test-kind',
        id: 'parent-id',
      },
      type: '',
      capacity: 0,
      free: 0,
      maintenance: '',
    },
    {
      id: '5',
      name: 'vmware-datastore-5',
      selfLink: `providers/vsphere/${VMWARE_03_UID}/datastores/5`,
      path: '/V2V-DC/datastore/datastore-01',
      revision: 1,
      parent: {
        kind: 'parent-test-kind',
        id: 'parent-id',
      },
      type: '',
      capacity: 0,
      free: 0,
      maintenance: '',
    },
  ],
};

export const MOCK_RHV_STORAGE_DOMAINS: { [uid in OvirtProviderIDs]: OVirtStorageDomain[] } = {
  [OVIRT_01_UID]: [
    {
      id: '1',
      name: 'rhv-storage-1',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/storagedomains/1`,
      path: 'Default/V2V-NFS4-Data-01',
      revision: 1,
      dataCenter: '',
      free: 0,
      type: '',
      capacity: 0,
      storage: { type: '' },
    },
    {
      id: '2',
      name: 'rhv-datastore-2',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/storagedomains/2`,
      path: 'Default/V2V-NFS4-Data-01',
      revision: 1,
      dataCenter: '',
      free: 0,
      type: '',
      capacity: 0,
      storage: { type: '' },
    },
  ],
  [OVIRT_02_UID]: [
    {
      id: '3',
      name: 'rhv-datastore-3',
      selfLink: `providers/ovirt/${OVIRT_02_UID}/storagedomains/3`,
      path: 'Default/V2V-NFS4-Data-01',
      revision: 1,
      dataCenter: '',
      free: 0,
      type: '',
      capacity: 0,
      storage: { type: '' },
    },
  ],
  [OVIRT_03_UID]: [
    {
      id: '4',
      name: 'rhv-datastore-4',
      selfLink: `providers/ovirt/${OVIRT_03_UID}/storagedomains/4`,
      path: 'Default/V2V-NFS4-Data-01',
      revision: 1,
      dataCenter: '',
      free: 0,
      type: '',
      capacity: 0,
      storage: { type: '' },
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      id: '5',
      name: 'rhv-datastore-5',
      selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/storagedomains/5`,
      path: 'Default/V2V-NFS4-Data-01',
      revision: 1,
      dataCenter: '',
      free: 0,
      type: '',
      capacity: 0,
      storage: { type: '' },
    },
  ],
};

export const MOCK_OPENSTACK_VOLUME_TYPES: { [uid in OpenstackProviderIDs]: OpenstackVolumeType[] } =
  {
    [OPENSTACK_01_UID]: [
      {
        id: '1',
        name: 'openstack-storage-1',
        selfLink: `providers/openstack/${OPENSTACK_01_UID}/volumetypes/1`,
        revision: 1,
        description: '',
        isPublic: true,
        qosSpecsID: '',
        publicAccess: true,
      },
      {
        id: '2',
        name: 'openstack-datastore-2',
        selfLink: `providers/openstack/${OPENSTACK_01_UID}/volumetypes/2`,
        revision: 1,
        description: '',
        isPublic: true,
        qosSpecsID: '',
        publicAccess: true,
      },
      {
        id: '3',
        name: 'openstack-datastore-3',
        selfLink: `providers/openstack/${OPENSTACK_01_UID}/volumetypes/3`,
        revision: 1,
        description: '',
        isPublic: true,
        qosSpecsID: '',
        publicAccess: true,
      },
    ],
    [OPENSTACK_02_UID]: [
      {
        id: '4',
        name: 'openstack-datastore-4',
        selfLink: `providers/openstack/${OPENSTACK_02_UID}/volumetypes/4`,
        revision: 1,
        description: '',
        isPublic: true,
        qosSpecsID: '',
        publicAccess: true,
      },
      {
        id: '5',
        name: 'openstack-datastore-5',
        selfLink: `providers/openstack/${OPENSTACK_02_UID}/volumetypes/5`,
        revision: 1,
        description: '',
        isPublic: true,
        qosSpecsID: '',
        publicAccess: true,
      },
    ],
  };

export const MOCK_OPENSHIFT_STORAGE_CLASS: {
  [uid in OpenshiftProviderIDs]: OpenShiftStorageClass[];
} = {
  [OPENSHIFT_HOST_UID]: [
    {
      uid: 'e9a5e83b-235c-4c75-92d1-2fcab54f6919',
      version: '269',
      namespace: '',
      name: 'standard',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/storageclasses/e9a5e83b-235c-4c75-92d1-2fcab54f6919`,
      object: {
        provisioner: 'rancher.io/local-path',
        metadata: {
          uid: 'e9a5e83b-235c-4c75-92d1-2fcab54f6919',
          resourceVersion: '269',
          name: 'standard',
          creationTimestamp: EPOCH.toISO(),
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
    {
      uid: 'uid-1',
      version: '1',
      namespace: '',
      name: 'large',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/uid-1`,
      object: {
        provisioner: 'test-provisioner',
        metadata: {
          uid: 'uid-1',
          resourceVersion: '1',
          name: 'large',
        },
      },
    },
    {
      uid: 'uid-2',
      version: '1',
      namespace: '',
      name: 'small',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/uid-2`,
      object: {
        provisioner: 'test-provisioner',
        metadata: {
          uid: 'uid-2',
          resourceVersion: '1',
          name: 'small',
        },
      },
    },
  ],
  [OPENSHIFT_01_UID]: [
    {
      uid: 'test-1',
      version: '1',
      namespace: '',
      name: 'standard',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/storageclasses/test-1`,
      object: {
        provisioner: 'test-provisioner',
        metadata: {
          uid: 'test-1',
          resourceVersion: '1',
          name: 'standard',
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
  ],
  [OPENSHIFT_02_UID]: [
    {
      uid: 'test-2',
      version: '1',
      namespace: '',
      name: 'standard',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/storageclasses/test-2`,
      object: {
        provisioner: 'test-provisioner',
        metadata: {
          uid: 'test-2',
          resourceVersion: '1',
          name: 'standard',
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
  ],
  [OPENSHIFT_03_UID]: [
    {
      uid: 'test-3',
      version: '1',
      namespace: '',
      name: 'standard',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/storageclasses/test-3`,
      object: {
        provisioner: 'test-provisioner',
        metadata: {
          uid: 'test-3',
          resourceVersion: '1',
          name: 'standard',
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
  ],
};
