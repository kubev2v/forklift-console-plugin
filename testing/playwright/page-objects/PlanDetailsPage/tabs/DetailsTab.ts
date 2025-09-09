import { expect, type Page } from '@playwright/test';

import type { PlanTestData } from '../../../types/test-data';

export class DetailsTab {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToDetailsTab(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await detailsTab.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyDetailsTab(planData: PlanTestData): Promise<void> {
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
    await this.verifyPlanStatus();
  }

  async verifyNavigationTabs(): Promise<void> {
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');
    await expect(detailsTab).toBeVisible();
    const planDetailsSection = this.page
      .locator('section.pf-m-light')
      .filter({ hasText: 'Plan details' });
    await expect(planDetailsSection).toBeVisible();
  }

  async verifyPlanDetails(planData: PlanTestData): Promise<void> {
    await expect(this.page.getByTestId('name-detail-item')).toContainText(planData.planName ?? '');
    await expect(this.page.getByTestId('project-detail-item')).toContainText(
      planData.planProject ?? '',
    );
    await expect(this.page.getByTestId('target-project-detail-item')).toContainText(
      planData.targetProject?.name ?? '',
    );
    await expect(this.page.getByTestId('created-at-detail-item')).toBeVisible();
    await expect(this.page.getByTestId('owner-detail-item')).toContainText('No owner');
  }

  async verifyPlanStatus(expectedStatus = 'Ready for migration'): Promise<void> {
    await expect(
      this.page.locator('.forklift-page-headings__status .pf-v5-c-label__text'),
    ).toContainText(expectedStatus, { timeout: 30000 });
    await expect(this.page.getByRole('button', { name: 'Start' })).toBeVisible();
  }
}
