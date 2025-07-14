export const setupProvidersIntercepts = () => {
  cy.intercept(
    'GET',
    '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/providers?limit=250',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: 'test-source-provider',
              namespace: 'openshift-mtv',
              uid: 'test-source-uid-1',
            },
            spec: {
              type: 'vsphere',
              url: 'https://test-vcenter.example.com',
            },
            status: {
              phase: 'Ready',
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The provider is ready.',
                },
              ],
            },
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: 'test-target-provider',
              namespace: 'openshift-mtv',
              uid: 'test-target-uid-1',
            },
            spec: {
              type: 'openshift',
              url: '',
            },
            status: {
              phase: 'Ready',
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The provider is ready.',
                },
              ],
            },
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Provider',
            metadata: {
              name: 'test-additional-provider',
              namespace: 'openshift-mtv',
              uid: 'test-additional-uid-1',
            },
            spec: {
              type: 'ovirt',
              url: 'https://test-ovirt.example.com',
            },
            status: {
              phase: 'Ready',
              conditions: [
                {
                  type: 'Ready',
                  status: 'True',
                  message: 'The provider is ready.',
                },
              ],
            },
          },
        ],
      },
    },
  ).as('getProviders');
};
