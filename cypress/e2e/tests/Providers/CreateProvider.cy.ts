describe('Providers list view', () => {
  beforeEach(() => {
    // close all nav items
    cy.visit('/');
    cy.wait(10000);
    // navigate to migration -> providers list
    cy.findByTestId('migration-nav-item').should('exist').click();
    cy.findByTestId('providers-nav-item').should('exist').click();
    cy.wait(10000);
  });

  it('has a add-provider button', () => {
    // find and click the create provider button (the 1st one since there are two occurrences)
    cy.findByTestId('add-provider-button').should('exist').click();
  });
});
