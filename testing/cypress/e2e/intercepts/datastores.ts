export const setupDatastoresIntercepts = (sourceProviderType = 'vsphere') => {
  cy.intercept(
    'GET',
    `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/datastores`,
    {
      statusCode: 200,
      body: [
        {
          id: 'test-datastore-1',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-datastore-1',
          revision: 212,
          name: 'test-datastore-1',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-1`,
        },
        {
          id: 'test-datastore-2',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-datastore-2',
          revision: 1,
          name: 'test-datastore-2',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-2`,
        },
        {
          id: 'test-datastore-3',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-datastore-3',
          revision: 217,
          name: 'test-datastore-3',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-3`,
        },
        {
          id: 'test-datastore-4',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-nfs-datastore',
          revision: 5,
          name: 'test-nfs-datastore',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-4`,
        },
        {
          id: 'test-datastore-5',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-shared-storage',
          revision: 212,
          name: 'test-shared-storage',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-5`,
        },
        {
          id: 'test-datastore-6',
          parent: {
            kind: 'Folder',
            id: 'group-test-datastore',
          },
          path: '/test/datastore/test-local-storage',
          revision: 227,
          name: 'test-local-storage',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/datastores/test-datastore-6`,
        },
      ],
    },
  ).as('getDatastores');
};
