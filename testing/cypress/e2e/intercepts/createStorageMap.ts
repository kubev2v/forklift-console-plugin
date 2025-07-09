export const setupCreateStorageMapIntercepts = () => {
  cy.intercept(
    'POST',
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps',
    {
      statusCode: 201,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'StorageMap',
        metadata: {
          creationTimestamp: '2025-01-01T16:54:00Z',
          generation: 1,
          managedFields: [
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:spec': {
                  '.': {},
                  'f:map': {},
                  'f:provider': {
                    '.': {},
                    'f:destination': {},
                    'f:source': {},
                  },
                },
              },
              manager: 'Mozilla',
              operation: 'Update',
              time: '2025-01-01T16:54:00Z',
            },
          ],
          name: 'test-create-plan-storagemap',
          namespace: 'openshift-mtv',
          resourceVersion: '5204217',
          uid: 'test-storagemap-uid-1',
        },
        spec: {
          map: [
            {
              destination: {
                storageClass: 'test-storage-class-1',
              },
              source: {
                id: 'test-datastore-1',
                name: 'test-datastore-1',
              },
            },
          ],
          provider: {
            destination: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'Provider',
              name: 'test-target-provider',
              namespace: 'openshift-mtv',
              uid: 'test-target-uid-1',
            },
            source: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'Provider',
              name: 'test-source-provider',
              namespace: 'openshift-mtv',
              uid: 'test-source-uid-1',
            },
          },
        },
      },
    },
  ).as('createStorageMap');
};
