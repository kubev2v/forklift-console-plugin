export const setupStorageMapsIntercepts = () => {
  cy.intercept(
    'GET',
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps?limit=250',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'StorageMap',
            metadata: {
              name: 'test-storage-map-1',
              namespace: 'openshift-mtv',
              uid: 'test-storagemap-uid-1',
            },
            spec: {
              map: [
                {
                  destination: {
                    storageClass: 'test-storage-class',
                  },
                  source: {
                    id: 'test-storage-id-1',
                    name: 'test-datastore-1',
                  },
                },
              ],
              provider: {
                destination: {
                  name: 'test-target-provider',
                  namespace: 'openshift-mtv',
                },
                source: {
                  name: 'test-source-provider',
                  namespace: 'openshift-mtv',
                },
              },
            },
            status: {
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The storage map is ready.',
                },
              ],
            },
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'StorageMap',
            metadata: {
              name: 'test-storage-map-2',
              namespace: 'openshift-mtv',
              uid: 'test-storagemap-uid-2',
            },
            spec: {
              map: [
                {
                  destination: {
                    storageClass: 'test-ssd-storage-class',
                  },
                  source: {
                    id: 'test-storage-id-2',
                    name: 'test-datastore-2',
                  },
                },
              ],
              provider: {
                destination: {
                  name: 'test-target-provider',
                  namespace: 'openshift-mtv',
                },
                source: {
                  name: 'test-source-provider',
                  namespace: 'openshift-mtv',
                },
              },
            },
            status: {
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The storage map is ready.',
                },
              ],
            },
          },
        ],
      },
    },
  ).as('getStorageMaps');
};
