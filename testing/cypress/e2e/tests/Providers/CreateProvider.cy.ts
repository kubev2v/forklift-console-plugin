const randomProvider = Math.floor(Math.random() * 100); // includes 0 to 300

describe('Creating a new provider', () => {
  beforeEach(() => {
    cy.session('kubeadmin-session', () => {
      cy.login();
    });
  });

  after(() => {
    cy.visit('/');
    cy.get('body').then(($body) => {
      if ($body.text().includes('tour')) {
        // pop windows skip tour
        cy.get('#tour-step-footer-secondary').check();
      }
    });
    cy.wait(10000);
    cy.findByTestId('migration-nav-item').should('exist').click();
    cy.findByTestId('providers-nav-item').should('exist').click();

    cy.contains('a', `${randomProvider}`) // Find the <a> with the provider name
      .closest('tr') // Go to the parent <tr>
      .within(() => {
        // Click the toggle button
        cy.get('button.pf-v5-c-menu-toggle').click();

        // Now click the "Delete Provider" menu item
        cy.contains('span.pf-v5-c-menu__item-text', 'Delete Provider').click();
      });
    cy.get('.pf-m-danger').should('have.text', 'Delete').click();
  });

  it('navigate to providers', () => {
    cy.visit('/');
    cy.get('body').then(($body) => {
      if ($body.text().includes('tour')) {
        // pop windows skip tour
        cy.get('#tour-step-footer-secondary').check();
      }
    });
    cy.wait(10000);
    cy.findByTestId('migration-nav-item').should('exist').click();
    cy.findByTestId('providers-nav-item').should('exist').click();
    cy.get('[data-test-id="host"]').should('exist');
    cy.get('.pf-v5-c-title.pf-m-2xl').should('have.text', 'Providers');
    cy.get('[data-testid="add-provider-button"]').should('exist').click();
    cy.get('.forklift-create-provider-edit-section')
      .should('contain.text', 'Provider details')
      .should('contain.text', 'Provider type');
    cy.get('.pf-v5-c-text-input-group__text-input').should('have.value', 'openshift-mtv');
    cy.wait(3000);
    cy.get('.pf-v5-c-card.pf-m-selectable')
      .eq(0)
      .should('be.visible')
      .click({ waitForAnimations: true });
    cy.wait(3000);
    cy.get('.pf-v5-c-text-input-group__text-input').should('have.value', 'openshift-mtv');
    cy.get('#k8sName').type(`newprovider${randomProvider}`);
    cy.get('input[name="sdkEndpoint"]:checked').then(($radio) => {
      const selectedId = $radio.attr('id');
      cy.log('Selected SDK Endpoint:', selectedId);
      expect(selectedId).to.equal('sdkEndpoint-vcenter');
    });
    console.log('Password value:', Cypress.env('VMWARE_URL'));
    cy.get('#url').type(Cypress.env('VMWARE_URL'));

    cy.get('#vddkInitImage').type(Cypress.env('VMWARE_VDDK'));
    cy.get('#username').type(Cypress.env('VMWARE_USERNAME'));
    cy.get('input[aria-label="Password input"]').type(Cypress.env('VMWARE_PASSWORD'));
    cy.get('.pf-v5-c-button.pf-m-secondary.forklift-certificate-upload-margin')
      .should('have.text', 'Fetch certificate from URL')
      .click();
    cy.get('#certificate-check').check();
    cy.wait(2000);
    cy.contains('button', 'Confirm').click();
    cy.get('.pf-v5-c-button.pf-m-primary.pf-m-progress')
      .should('have.text', 'Create provider')
      .click();
    cy.wait(10000);
  });

  // it('clean the new provider', () => {
  //   cy.visit('/');
  //   cy.get('body').then(($body) => {
  //     if ($body.text().includes('tour')) {
  //       // pop windows skip tour
  //       cy.get('#tour-step-footer-secondary').check();
  //     }
  //   });
  //   cy.wait(10000);
  //   cy.findByTestId('migration-nav-item').should('exist').click();
  //   cy.findByTestId('providers-nav-item').should('exist').click();

  //   cy.contains('a', `${randomProvider}`) // Find the <a> with the provider name
  //     .closest('tr') // Go to the parent <tr>
  //     .within(() => {
  //       // Click the toggle button
  //       cy.get('button.pf-v5-c-menu-toggle').click();

  //       // Now click the "Delete Provider" menu item
  //       cy.contains('span.pf-v5-c-menu__item-text', 'Delete Provider').click();
  //     });
  //   cy.get('.pf-m-danger').should('have.text', 'Delete').click();
  // });
});
