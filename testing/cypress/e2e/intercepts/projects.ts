export const setupProjectsIntercepts = () => {
  cy.intercept('GET', '/api/kubernetes/apis/project.openshift.io/v1/projects?limit=250', {
    statusCode: 200,
    body: {
      kind: 'ProjectList',
      apiVersion: 'project.openshift.io/v1',
      metadata: {},
      items: [
        {
          metadata: {
            name: 'openshift-mtv',
            uid: 'openshift-mtv-uid',
            labels: {
              'kubernetes.io/metadata.name': 'openshift-mtv',
            },
          },
          spec: {
            finalizers: ['kubernetes'],
          },
          status: {
            phase: 'Active',
          },
        },
        {
          metadata: {
            name: 'test-target-project',
            uid: 'test-target-project-uid',
            labels: {
              'kubernetes.io/metadata.name': 'test-target-project',
            },
          },
          spec: {
            finalizers: ['kubernetes'],
          },
          status: {
            phase: 'Active',
          },
        },
      ],
    },
  }).as('getProjects');

  // Add namespaces intercept for CI environment (Kubernetes instead of OpenShift)
  cy.intercept('GET', '/api/kubernetes/api/v1/namespaces?limit=250', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        kind: 'NamespaceList',
        apiVersion: 'v1',
        metadata: {},
        items: [
          {
            metadata: {
              name: 'openshift-mtv',
              uid: 'openshift-mtv-uid',
              labels: {
                'kubernetes.io/metadata.name': 'openshift-mtv',
              },
            },
            spec: {
              finalizers: ['kubernetes'],
            },
            status: {
              phase: 'Active',
            },
          },
          {
            metadata: {
              name: 'test-target-project',
              uid: 'test-target-project-uid',
              labels: {
                'kubernetes.io/metadata.name': 'test-target-project',
              },
            },
            spec: {
              finalizers: ['kubernetes'],
            },
            status: {
              phase: 'Active',
            },
          },
        ],
      },
    });
  }).as('getNamespaces');
};
