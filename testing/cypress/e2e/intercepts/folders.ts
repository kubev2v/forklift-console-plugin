export const setupFoldersIntercepts = (sourceProviderType = 'vsphere') => {
  cy.intercept(
    'GET',
    `**/forklift-inventory/providers/${sourceProviderType}/test-source-uid-1/folders?detail=4`,
    {
      statusCode: 200,
      body: [
        {
          id: 'test-folder-1',
          parent: {
            kind: 'Datacenter',
            id: 'test-datacenter-1',
          },
          path: '/test/folder/test-folder-1',
          revision: 1,
          name: 'Test Folder 1',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/folders/test-folder-1`,
          datacenter: 'test-datacenter-1',
          children: 0,
        },
        {
          id: 'test-folder-2',
          parent: {
            kind: 'Datacenter',
            id: 'test-datacenter-1',
          },
          path: '/test/folder/test-folder-2',
          revision: 1,
          name: 'Test Folder 2',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/folders/test-folder-2`,
          datacenter: 'test-datacenter-1',
          children: 0,
        },
        {
          id: 'test-folder-3',
          parent: {
            kind: 'Datacenter',
            id: 'test-datacenter-1',
          },
          path: '/test/folder/test-folder-3',
          revision: 1,
          name: 'Test Folder 3',
          selfLink: `providers/${sourceProviderType}/test-source-uid-1/folders/test-folder-3`,
          datacenter: 'test-datacenter-1',
          children: 0,
        },
      ],
    },
  ).as('getFolders');
};
