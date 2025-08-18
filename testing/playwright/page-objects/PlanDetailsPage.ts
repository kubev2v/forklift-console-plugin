import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../types/test-data';

export class PlanDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyBasicPlanDetailsPage(planData: PlanTestData) {
    await this.verifyPlanTitle(planData.planName);
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
    await this.verifyPlanStatus();
  }

  async verifyBreadcrumbs() {
    await expect(this.page.getByTestId('breadcrumb-link-0')).toContainText('Plans');
    await expect(this.page.locator('.pf-v5-c-breadcrumb__item').last()).toContainText(
      'Plan Details',
    );
  }

  async verifyNavigationTabs(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await expect(detailsTab).toBeVisible();
    const planDetailsSection = this.page
      .locator('section.pf-m-light')
      .filter({ hasText: 'Plan details' });
    await expect(planDetailsSection).toBeVisible();
  }

  async verifyPlanDetails(
    planData: Pick<PlanTestData, 'planName' | 'planProject' | 'targetProject'>,
  ) {
    await expect(this.page.getByTestId('name-detail-item')).toContainText(planData.planName);
    await expect(this.page.getByTestId('project-detail-item')).toContainText(planData.planProject);
    await expect(this.page.getByTestId('target-project-detail-item')).toContainText(
      planData.targetProject,
    );
    await expect(this.page.getByTestId('created-at-detail-item')).toBeVisible();
    await expect(this.page.getByTestId('owner-detail-item')).toContainText('No owner');
  }

  async verifyPlanDetailsURL(planName: string) {
    // Use string contains check instead of regex to avoid ReDoS vulnerability
    await expect(this.page).toHaveURL((url) =>
      url.toString().includes(`forklift.konveyor.io~v1beta1~Plan/${planName}`),
    );
  }

  async verifyPlanStatus(expectedStatus = 'Ready for migration') {
    await expect(
      this.page.locator('.forklift-page-headings__status .pf-v5-c-label__text'),
    ).toContainText(expectedStatus, { timeout: 30000 });
    await expect(this.page.getByRole('button', { name: 'Start' })).toBeVisible();
  }

  async verifyPlanTitle(planName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('resource-details-title');
    await expect(titleLocator).toContainText(planName, { timeout: 15000 });
  }
}
