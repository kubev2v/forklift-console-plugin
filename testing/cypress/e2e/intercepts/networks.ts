export const setupNetworksIntercepts = (
  sourceProviderType = 'vsphere',
  targetProviderId = 'test-target-uid-1',
) => {
  // Intercept source provider networks requests
  cy.intercept(
    'GET',
    `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/networks`,
    {
      statusCode: 200,
      body: [
        {
          uid: 'test-network-1-uid',
          version: '12345',
          namespace: '',
          name: 'test-vm-network',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/networks/test-network-1-uid`,
          id: 'test-network-1-uid',
          object: {
            name: 'test-vm-network',
            type: 'DistributedVirtualPortgroup',
            vlan: 100,
          },
        },
        {
          uid: 'test-network-2-uid',
          version: '12346',
          namespace: '',
          name: 'test-mgmt-network',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/networks/test-network-2-uid`,
          id: 'test-network-2-uid',
          object: {
            name: 'test-mgmt-network',
            type: 'DistributedVirtualPortgroup',
            vlan: 200,
          },
        },
      ],
    },
  ).as('getSourceNetworks');

  // Intercept target provider network attachment definitions requests
  cy.intercept(
    'GET',
    `**/forklift-inventory/providers/openshift/${targetProviderId}/networkattachmentdefinitions`,
    {
      statusCode: 200,
      body: [
        {
          uid: 'test-nad-1-uid',
          version: '12345',
          namespace: 'test-target-namespace',
          name: 'test-multus-bridge',
          selfLink: `providers/openshift/${targetProviderId}/networkattachmentdefinitions/test-nad-1-uid`,
          id: 'test-nad-1-uid',
          object: {
            apiVersion: 'k8s.cni.cncf.io/v1',
            kind: 'NetworkAttachmentDefinition',
            metadata: {
              name: 'test-multus-bridge',
              namespace: 'test-target-namespace',
              uid: 'test-nad-1-uid',
              resourceVersion: '12345',
              creationTimestamp: '2025-01-01T00:00:00Z',
            },
            spec: {
              config:
                '{"cniVersion":"0.3.1","name":"test-multus-bridge","type":"bridge","bridge":"br0","isDefaultGateway":true,"ipMasq":true,"hairpinMode":true,"ipam":{"type":"host-local","subnet":"192.168.1.0/24"}}',
            },
          },
        },
      ],
    },
  ).as('getTargetNetworkAttachmentDefinitions');
};
