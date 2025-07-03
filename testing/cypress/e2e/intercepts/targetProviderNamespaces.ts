export const setupTargetProviderNamespacesIntercepts = (targetProviderId: string) => {
  cy.intercept('GET', `**/forklift-inventory/providers/openshift/${targetProviderId}/namespaces`, {
    statusCode: 200,
    body: [
      {
        name: 'default',
        uid: 'default-uid',
      },
      {
        name: 'test-target-project',
        uid: 'test-target-project-uid',
      },
      {
        name: 'openshift-mtv',
        uid: 'openshift-mtv-uid',
      },
    ],
  }).as('getTargetProviderNamespaces');
};
