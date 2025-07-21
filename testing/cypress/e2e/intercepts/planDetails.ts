export const setupPlanDetailsIntercepts = () => {
  cy.intercept(
    'GET',
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans/test-create-plan',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        metadata: {
          annotations: {
            populatorLabels: 'True',
          },
          creationTimestamp: '2025-01-01T16:54:00Z',
          generation: 1,
          managedFields: [
            {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              fieldsType: 'FieldsV1',
              fieldsV1: {
                'f:spec': {
                  '.': {},
                  'f:map': {
                    '.': {},
                    'f:network': {},
                    'f:storage': {},
                  },
                  'f:migrateSharedDisks': {},
                  'f:provider': {
                    '.': {},
                    'f:destination': {},
                    'f:source': {},
                  },
                  'f:pvcNameTemplateUseGenerateName': {},
                  'f:skipGuestConversion': {},
                  'f:targetNamespace': {},
                  'f:vms': {},
                  'f:warm': {},
                },
              },
              manager: 'Mozilla',
              operation: 'Update',
              time: '2025-01-01T16:54:00Z',
            },
          ],
          name: 'test-create-plan',
          namespace: 'openshift-mtv',
          resourceVersion: '5204230',
          uid: 'test-plan-uid-1',
        },
        spec: {
          map: {
            network: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'NetworkMap',
              name: 'test-create-plan-networkmap',
              namespace: 'openshift-mtv',
              uid: 'test-networkmap-uid-1',
            },
            storage: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'StorageMap',
              name: 'test-create-plan-storagemap',
              namespace: 'openshift-mtv',
              uid: 'test-storagemap-uid-1',
            },
          },
          migrateSharedDisks: false,
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
          pvcNameTemplateUseGenerateName: true,
          skipGuestConversion: false,
          targetNamespace: 'test-target-project',
          vms: [
            {
              id: 'test-vm-1',
              name: 'test-virtual-machine-1',
            },
          ],
          warm: false,
        },
        status: {
          conditions: [
            {
              category: 'Advisory',
              lastTransitionTime: '2025-01-01T16:54:00Z',
              message: 'The plan is ready.',
              reason: 'Ready',
              status: 'True',
              type: 'Ready',
            },
          ],
        },
      },
    },
  ).as('getPlanDetails');
};
