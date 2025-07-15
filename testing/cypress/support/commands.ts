import '@testing-library/cypress/add-commands';

// Custom command to prevent guided tour modal from appearing
Cypress.Commands.add('disableGuidedTour', () => {
  cy.window().then((win) => {
    const existingSettings = win.localStorage.getItem('console-user-settings');
    const settings = existingSettings ? JSON.parse(existingSettings) : {};

    // Add guided tour completion to the settings
    win.localStorage.setItem(
      'console-user-settings',
      JSON.stringify({ ...settings, 'console.guidedTour': { admin: { completed: true } } }),
    );
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      disableGuidedTour: () => Chainable<void>;
    }
  }
}
