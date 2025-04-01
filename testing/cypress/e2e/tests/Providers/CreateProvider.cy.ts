describe('Providers list view', () => {
  beforeEach(() => {
    // Close all nav items
    cy.visit('/');
    // Navigate to migration -> providers list
    cy.findByTestId('migration-nav-item').should('exist').click();
    cy.findByTestId('providers-nav-item').should('exist').click();
  });

  it('has a add-provider button', () => {
    // Find and click the create provider button (the 1st one since there are two occurrences)
    cy.findByTestId('add-provider-button').should('exist').click();
  });
});
