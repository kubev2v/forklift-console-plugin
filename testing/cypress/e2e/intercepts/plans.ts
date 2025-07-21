export const setupPlansIntercepts = () => {
  // Intercept the API call for getting existing plans
  cy.intercept(
    'GET',
    '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/*/plans?limit=250',
    {
      statusCode: 200,
      body: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'PlanList',
        metadata: {},
        items: [],
      },
    },
  ).as('getPlans');

  // Also intercept the all-namespaces version
  cy.intercept('GET', '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/plans?limit=250', {
    statusCode: 200,
    body: {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'PlanList',
      metadata: {},
      items: [],
    },
  }).as('getAllPlans');

  // Intercept all SubjectAccessReview calls (for plans and other resources)
  cy.intercept(
    'POST',
    '/api/kubernetes/apis/authorization.k8s.io/v1/subjectaccessreviews',
    (req) => {
      req.reply({
        statusCode: 200,
        body: {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'SubjectAccessReview',
          status: {
            allowed: true,
          },
        },
      });
    },
  ).as('subjectAccessReview');
};
