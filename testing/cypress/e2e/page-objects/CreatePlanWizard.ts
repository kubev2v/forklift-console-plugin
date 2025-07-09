export class CreatePlanWizard {
  clickCreatePlan() {
    cy.findByRole('button', { name: 'Create plan' }).should('be.visible').and('be.enabled').click();
  }

  clickNext() {
    cy.findByTestId('wizard-next-button').should('be.enabled').click();
  }

  clickReviewAndCreate() {
    cy.findByTestId('wizard-review-button').should('be.visible').and('be.enabled').click();
  }

  fillPlanName(planName: string) {
    cy.findByTestId('plan-name-input').clear().type(planName);
  }

  selectFirstVirtualMachine() {
    cy.findByRole('grid').within(() => {
      cy.get('tbody tr')
        .first()
        .within(() => {
          cy.get('input[type="checkbox"]').should('be.visible').check();
        });
    });
  }

  selectNetworkMap(mapName: string) {
    cy.findByTestId('network-map-select').should('be.visible').click();
    cy.findByText(mapName).should('be.visible').click();
  }

  selectPlanProject(projectName: string) {
    cy.get('#plan-project-select', { timeout: 15000 }).should('be.visible').click();
    cy.findByText(projectName).should('be.visible').click();
  }

  selectSourceProvider(providerName: string) {
    cy.findByTestId('source-provider-select').should('be.visible').click();
    cy.findByText(providerName).should('be.visible').click();
  }

  selectStorageMap(mapName: string) {
    cy.findByTestId('storage-map-select').should('be.visible').click();
    cy.findByText(mapName).should('be.visible').click();
  }

  selectTargetProject(projectName: string) {
    cy.get('#target-project-select').should('be.visible').click();
    cy.get('.pf-v5-c-menu__item-text').contains(projectName).closest('button').click();
  }

  selectTargetProvider(providerName: string) {
    cy.findByTestId('target-provider-select').should('be.visible').click();
    cy.findByText(providerName).should('be.visible').click();
  }

  verifyGeneralSection(data: {
    planName: string;
    planProject: string;
    sourceProvider: string;
    targetProvider: string;
    targetProject: string;
  }) {
    cy.findByTestId('review-general-section').within(() => {
      cy.findByTestId('review-plan-name').should('contain', data.planName);
      cy.findByTestId('review-plan-project').should('contain', data.planProject);
      cy.findByTestId('review-source-provider').should('contain', data.sourceProvider);
      cy.findByTestId('review-target-provider').should('contain', data.targetProvider);
      cy.findByTestId('review-target-project').should('contain', data.targetProject);
    });
  }

  verifyGeneralStepVisible() {
    cy.findByRole('heading', { name: 'General' }).should('be.visible');
  }

  verifyHooksSection() {
    cy.findByTestId('review-hooks-section').within(() => {
      cy.findByTestId('review-pre-migration-hook-enabled').should('contain', 'False');
      cy.findByTestId('review-post-migration-hook-enabled').should('contain', 'False');
    });
  }

  verifyMigrationTypeSection(migrationType = 'Cold migration') {
    cy.findByTestId('review-migration-type-section').within(() => {
      cy.findByTestId('review-migration-type').should('contain', migrationType);
    });
  }

  verifyNetworkMapSection(networkMapName: string) {
    cy.findByTestId('review-network-map-section').within(() => {
      cy.findByTestId('review-network-map').should('contain', networkMapName);
    });
  }

  verifyNetworkMapStepVisible() {
    cy.findByRole('heading', { name: 'Network map' }).should('be.visible');
  }

  verifyOtherSettingsSection() {
    cy.findByTestId('review-other-settings-section').within(() => {
      cy.findByTestId('review-disk-decryption-passphrases').should('contain', 'None');
      cy.findByTestId('review-transfer-network').should('contain', 'Target provider default');
      cy.findByTestId('review-preserve-static-ips').should('contain', 'Disabled');
      cy.findByTestId('review-root-device').should('contain', 'First root device');
      cy.findByTestId('review-shared-disks').should('contain', 'Enabled');
    });
  }

  verifyRedirectToPlanDetails(planName: string) {
    cy.url().should(
      'include',
      `/k8s/ns/openshift-mtv/forklift.konveyor.io~v1beta1~Plan/${planName}`,
    );
    cy.wait('@getPlanDetails');
    cy.findByRole('heading', { name: new RegExp(planName, 'i') }).should('be.visible');
  }

  verifyReviewStepVisible() {
    cy.findByRole('heading', { name: 'Review and create' }).should('be.visible');
  }

  verifyStorageMapSection(storageMapName: string) {
    cy.findByTestId('review-storage-map-section').within(() => {
      cy.findByTestId('review-storage-map').should('contain', storageMapName);
    });
  }

  verifyStorageMapStepVisible() {
    cy.findByRole('heading', { name: 'Storage map' }).should('be.visible');
  }

  verifyVirtualMachinesSection(vmCount = '1 virtual machine selected') {
    cy.findByTestId('review-virtual-machines-section').within(() => {
      cy.findByTestId('review-vm-count').should('contain', vmCount);
    });
  }

  verifyVirtualMachinesStepVisible() {
    cy.findByRole('heading', { name: 'Virtual machines' }).should('be.visible');
  }

  verifyVirtualMachinesTableLoaded() {
    cy.findByRole('grid').should('be.visible');
  }

  verifyWizardOpened() {
    cy.url().should('include', 'forklift.konveyor.io~v1beta1~Plan/~new');
    cy.findByTestId('create-plan-wizard').should('be.visible');
  }

  waitForNetworkMaps() {
    cy.wait('@getNetworkMaps');
  }

  waitForPlanCreation() {
    cy.wait('@createNetworkMap');
    cy.wait('@createStorageMap');
    cy.wait('@createPlan');
    cy.wait('@patchNetworkMapOwner');
    cy.wait('@patchStorageMapOwner');
  }

  waitForStorageMaps() {
    cy.wait('@getStorageMaps');
  }

  waitForTargetProviderNamespaces() {
    cy.wait('@getTargetProviderNamespaces');
  }

  waitForVirtualMachinesData() {
    cy.wait('@getVirtualMachines', { timeout: 15000 });
    cy.wait('@getHosts', { timeout: 10000 });
    cy.wait('@getFolders', { timeout: 10000 });
    cy.wait('@getDatastores', { timeout: 10000 });
    cy.wait('@getStorageClasses', { timeout: 10000 });
  }
}
