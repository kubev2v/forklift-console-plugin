import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CreatePlanWizardPage {
  constructor(private page: Page) {}

  // Navigation
  async navigateFromPlansPage() {
    await this.page.getByTestId('create-plan-button').click();
    await this.waitForWizardLoad();
  }

  async waitForWizardLoad() {
    await expect(this.page.getByTestId('create-plan-wizard')).toBeVisible();
  }

  // Step 1: General Settings
  async fillPlanName(name: string) {
    await this.page.getByTestId('plan-name-input').fill(name);
  }

  async fillPlanDescription(description: string) {
    await this.page.getByTestId('plan-description-input').fill(description);
  }

  async selectTargetNamespace(namespace: string) {
    await this.page.getByTestId('target-namespace-select').click();
    await this.page.getByRole('option', { name: namespace }).click();
  }

  // Step 2: Source Provider
  async selectSourceProvider(providerName: string) {
    await this.page.getByTestId('source-provider-select').click();
    await this.page.getByRole('option', { name: providerName }).click();
  }

  // Step 3: Target Provider  
  async selectTargetProvider(providerName: string) {
    await this.page.getByTestId('target-provider-select').click();
    await this.page.getByRole('option', { name: providerName }).click();
  }

  // Step 4: VM Selection
  async selectVirtualMachine(vmName: string) {
    await this.page.getByTestId(`vm-checkbox-${vmName}`).check();
  }

  async selectAllVMs() {
    await this.page.getByTestId('select-all-vms').check();
  }

  // Navigation between steps
  async clickNext() {
    await this.page.getByTestId('wizard-next-button').click();
  }

  async clickBack() {
    await this.page.getByTestId('wizard-back-button').click();
  }

  async clickFinish() {
    await this.page.getByTestId('wizard-finish-button').click();
  }

  // Validation helpers
  async verifyCurrentStep(stepNumber: number) {
    await expect(this.page.getByTestId(`wizard-step-${stepNumber}`)).toHaveClass(/current/);
  }

  async verifyPlanCreated(planName: string) {
    await expect(this.page.getByText(`Plan "${planName}" created successfully`)).toBeVisible();
  }
} 