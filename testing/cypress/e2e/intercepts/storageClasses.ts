export const setupStorageClassesIntercepts = (targetProviderId = 'test-target-uid-1') => {
  cy.intercept(
    'GET',
    `**/forklift-inventory/providers/openshift/${targetProviderId}/storageclasses?detail=1`,
    {
      statusCode: 200,
      body: [
        {
          uid: 'test-storage-class-1-uid',
          version: '12345',
          namespace: '',
          name: 'test-ceph-rbd',
          selfLink: `providers/openshift/${targetProviderId}/storageclasses/test-storage-class-1-uid`,
          id: 'test-storage-class-1-uid',
          object: {
            metadata: {
              name: 'test-ceph-rbd',
              uid: 'test-storage-class-1-uid',
              resourceVersion: '12345',
              creationTimestamp: '2025-01-01T00:00:00Z',
              annotations: {
                'storageclass.kubernetes.io/is-default-class': 'true',
              },
              managedFields: [
                {
                  manager: 'test-storage-operator',
                  operation: 'Update',
                  apiVersion: 'storage.k8s.io/v1',
                  time: '2025-01-01T00:00:00Z',
                  fieldsType: 'FieldsV1',
                  fieldsV1: {
                    'f:allowVolumeExpansion': {},
                    'f:provisioner': {},
                    'f:reclaimPolicy': {},
                    'f:volumeBindingMode': {},
                  },
                },
              ],
            },
            provisioner: 'test.csi.ceph.com',
            parameters: {
              'csi.storage.k8s.io/provisioner-secret-name': 'test-provisioner-secret',
              'csi.storage.k8s.io/provisioner-secret-namespace': 'test-storage',
              'csi.storage.k8s.io/fstype': 'ext4',
              pool: 'test-ceph-pool',
            },
            reclaimPolicy: 'Delete',
            allowVolumeExpansion: true,
            volumeBindingMode: 'Immediate',
          },
        },
        {
          uid: 'test-storage-class-2-uid',
          version: '12346',
          namespace: '',
          name: 'test-ceph-fs',
          selfLink: `providers/openshift/${targetProviderId}/storageclasses/test-storage-class-2-uid`,
          id: 'test-storage-class-2-uid',
          object: {
            metadata: {
              name: 'test-ceph-fs',
              uid: 'test-storage-class-2-uid',
              resourceVersion: '12346',
              creationTimestamp: '2025-01-01T00:00:00Z',
              annotations: {
                'storageclass.kubernetes.io/is-default-class': 'false',
              },
              managedFields: [
                {
                  manager: 'test-storage-operator',
                  operation: 'Update',
                  apiVersion: 'storage.k8s.io/v1',
                  time: '2025-01-01T00:00:00Z',
                  fieldsType: 'FieldsV1',
                  fieldsV1: {
                    'f:allowVolumeExpansion': {},
                    'f:provisioner': {},
                    'f:reclaimPolicy': {},
                    'f:volumeBindingMode': {},
                  },
                },
              ],
            },
            provisioner: 'test.csi.cephfs.com',
            parameters: {
              'csi.storage.k8s.io/provisioner-secret-name': 'test-cephfs-secret',
              'csi.storage.k8s.io/provisioner-secret-namespace': 'test-storage',
              fsName: 'test-cephfs',
            },
            reclaimPolicy: 'Delete',
            allowVolumeExpansion: true,
            volumeBindingMode: 'Immediate',
          },
        },
        {
          uid: 'test-storage-class-3-uid',
          version: '12347',
          namespace: '',
          name: 'test-local-block',
          selfLink: `providers/openshift/${targetProviderId}/storageclasses/test-storage-class-3-uid`,
          id: 'test-storage-class-3-uid',
          object: {
            metadata: {
              name: 'test-local-block',
              uid: 'test-storage-class-3-uid',
              resourceVersion: '12347',
              creationTimestamp: '2025-01-01T00:00:00Z',
              labels: {
                'local.storage.openshift.io/owner-kind': 'LocalVolume',
                'local.storage.openshift.io/owner-name': 'test-local-block',
                'local.storage.openshift.io/owner-namespace': 'test-local-storage',
              },
              managedFields: [
                {
                  manager: 'test-local-storage-operator',
                  operation: 'Update',
                  apiVersion: 'storage.k8s.io/v1',
                  time: '2025-01-01T00:00:00Z',
                  fieldsType: 'FieldsV1',
                  fieldsV1: {
                    'f:provisioner': {},
                    'f:reclaimPolicy': {},
                    'f:volumeBindingMode': {},
                  },
                },
              ],
            },
            provisioner: 'kubernetes.io/no-provisioner',
            reclaimPolicy: 'Delete',
            volumeBindingMode: 'WaitForFirstConsumer',
          },
        },
      ],
    },
  ).as('getStorageClasses');
};
