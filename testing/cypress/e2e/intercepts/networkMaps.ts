export const setupNetworkMapsIntercepts = () => {
  cy.intercept(
    'GET',
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps?limit=250',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        items: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'NetworkMap',
            metadata: {
              name: 'test-network-map-1',
              namespace: 'openshift-mtv',
              uid: 'test-netmap-uid-1',
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
                  message: 'The network map is ready.',
                },
              ],
            },
          },
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'NetworkMap',
            metadata: {
              name: 'test-network-map-2',
              namespace: 'openshift-mtv',
              uid: 'test-netmap-uid-2',
            },
            spec: {
              map: [
                {
                  destination: {
                    type: 'multus',
                  },
                  source: {
                    type: 'bridge',
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
                  message: 'The network map is ready.',
                },
              ],
            },
          },
        ],
      },
    },
  ).as('getNetworkMaps');
};
