import { setupPlansIntercepts } from '../intercepts/plans';
import { PlansListPage } from '../page-objects/PlansListPage';

describe('Plan list', () => {
  const plansPage = new PlansListPage();

  beforeEach(() => {
    // Disable guided tour modal before tests
    cy.disableGuidedTour();

    setupPlansIntercepts();

    plansPage.navigateFromMainMenu();
  });

  it('should display the Create Plan button', () => {
    plansPage.waitForPageLoad();
    cy.findByTestId('create-plan-button').should('be.visible').and('be.enabled');
  });
});
