export class PlansListPage {
  clickCreatePlanButton() {
    // Wait for all providers to load (needed for hasSufficientProviders check)
    cy.wait('@getAllProviders');

    // Wait for the button to be fully ready (permissions and providers loaded)
    cy.findByTestId('create-plan-button', { timeout: 30000 })
      .should('be.visible')
      .and('be.enabled')
      .and('not.have.attr', 'aria-disabled', 'true')
      .click();
  }

  navigateFromMainMenu() {
    cy.visit('/', { failOnStatusCode: false });

    cy.get('[data-test="loading-indicator"]', { timeout: 30000 }).should('not.exist');

    cy.findByTestId('migration-nav-item', { timeout: 30000 }).should('be.visible').click();
    cy.findByTestId('plans-nav-item').should('be.visible').click();
    cy.url().should('include', 'forklift.konveyor.io~v1beta1~Plan');
  }

  waitForPageLoad() {
    cy.findByRole('grid', { name: 'Migration plans' }).should('be.visible');
  }
}
