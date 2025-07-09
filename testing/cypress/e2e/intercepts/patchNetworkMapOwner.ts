export const setupPatchNetworkMapOwnerIntercepts = () => {
  cy.intercept(
    'PATCH',
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps/test-create-plan-networkmap',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'NetworkMap',
        metadata: {
          creationTimestamp: '2025-01-01T16:54:00Z',
          generation: 1,
          managedFields: [
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:metadata': {
                  'f:ownerReferences': {
                    '.': {},
                    'k:{"uid":"test-plan-uid-1"}': {},
                  },
                },
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
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:status': {
                  '.': {},
                  'f:conditions': {},
                  'f:observedGeneration': {},
                  'f:references': {},
                },
              },
              manager: 'forklift-controller',
              operation: 'Update',
              subresource: 'status',
              time: '2025-01-01T16:54:00Z',
            },
          ],
          name: 'test-create-plan-networkmap',
          namespace: 'openshift-mtv',
          ownerReferences: [
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'Plan',
              name: 'test-create-plan',
              uid: 'test-plan-uid-1',
            },
          ],
          resourceVersion: '5216924',
          uid: 'test-networkmap-uid-1',
        },
        spec: {
          map: [
            {
              destination: {
                type: 'pod',
              },
              source: {
                type: 'pod',
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
        status: {
          conditions: [
            {
              category: 'Required',
              lastTransitionTime: '2025-01-01T16:54:00Z',
              message: 'The network map is ready.',
              status: 'True',
              type: 'Ready',
            },
          ],
          observedGeneration: 1,
          references: [
            {
              type: 'pod',
            },
          ],
        },
      },
    },
  ).as('patchNetworkMapOwner');
};
