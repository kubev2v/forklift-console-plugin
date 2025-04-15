import { KUBEADMIN_USERNAME, KUBEADMIN_IDP } from './constants';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(providerName?: string, username?: string, password?: string): Chainable<Element>;
      logout(): Chainable<Element>;
    }
  }
}

// const KUBEADMIN_USERNAME = 'kubeadmin';
// const KUBEADMIN_IDP = 'kube:admin';

Cypress.Commands.add('login', (provider: string, username: string, password: string) => {
  // Check if auth is disabled (for a local development environment).
  cy.visit(''); // visits baseUrl which is set in plugins.js
  cy.window().then((win: any) => {
    cy.clearCookie('openshift-session-token');

    cy.get('[data-test-id=login]', { timeout: 60000 }).should('be.visible');
    const idp = provider || KUBEADMIN_IDP;
    cy.get('[data-test-id="login"]').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.text().includes(idp)) {
        cy.contains(idp).should('be.visible').click();
      }
    });
    cy.get('#inputUsername').type(username || KUBEADMIN_USERNAME);
    cy.get('#inputPassword').type(password || Cypress.env('BRIDGE_KUBEADMIN_PASSWORD'));
    cy.get('button[type=submit]').click();
  });
});
