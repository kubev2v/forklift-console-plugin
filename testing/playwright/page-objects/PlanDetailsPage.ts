import { expect, type Page } from '@playwright/test';

export class PlanDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyBasicPlanDetailsPage(planData?: {
    planName: string;
    sourceProvider: string;
    targetProvider: string;
    targetProject: string;
  }) {
    await this.waitForPageLoad();

    // Verify that navigation tabs are visible
    await this.verifyNavigationTabs();

    // Verify that the Plan title is visible and correct
    if (planData?.planName) {
      await this.verifyPlanTitle(planData.planName);
    }
  }

  async verifyBreadcrumbs() {
    // Verify breadcrumb navigation
    await expect(this.page.getByTestId('breadcrumb-link-0')).toContainText('Plans');
    await expect(this.page.locator('.pf-v5-c-breadcrumb__item').last()).toContainText(
      'Plan Details',
    );
  }

  async verifyNavigationTabs(): Promise<void> {
    // Verify the Details tab exists and is visible
    const detailsTab = this.page.locator('[data-test-id="horizontal-link-Details"]');

    await expect(detailsTab).toBeVisible({ timeout: 10000 });
    const planDetailsSection = this.page
      .locator('section.pf-m-light')
      .filter({ hasText: 'Plan details' });
    await expect(planDetailsSection).toBeVisible({ timeout: 15000 });
  }

  async verifyPlanDetails(planData: {
    planName: string;
    planProject: string;
    targetProject: string;
  }) {
    // Verify Plan Details section content - use more specific selectors
    const planDetailsSection = this.page.locator('section').filter({ hasText: 'Plan details' });

    // Verify plan name (take first occurrence to avoid ambiguity)
    await expect(
      planDetailsSection.locator('dd').filter({ hasText: planData.planName }).first(),
    ).toBeVisible();

    // Verify project (should be a link with specific data-test attribute)
    await expect(planDetailsSection.getByTestId(planData.planProject)).toBeVisible();

    // Verify target project (take first occurrence)
    await expect(
      planDetailsSection.locator('dd').filter({ hasText: planData.targetProject }).first(),
    ).toBeVisible();

    // Verify created at timestamp exists
    await expect(planDetailsSection.locator('.pf-v5-c-timestamp')).toBeVisible();

    // Verify owner field shows "No owner"
    await expect(
      planDetailsSection.locator('dd').filter({ hasText: 'No owner' }).first(),
    ).toBeVisible();
  }

  async verifyPlanDetailsURL(planName: string) {
    // Verify we're on the correct plan details page
    // Use string contains check instead of regex to avoid ReDoS vulnerability
    await expect(this.page).toHaveURL((url) =>
      url.toString().includes(`forklift.konveyor.io~v1beta1~Plan/${planName}`),
    );
  }

  async verifyPlanStatus(expectedStatus = 'Ready for migration') {
    // Verify the plan status label
    await expect(this.page.locator('.forklift-plan-status__grey-label')).toContainText(
      expectedStatus,
    );

    // Verify the Start button is present
    await expect(this.page.getByRole('button', { name: 'Start' })).toBeVisible();
  }

  async verifyPlanTitle(planName: string): Promise<void> {
    const titleLocator = this.page.getByTestId('plan-details-title');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    const actualText = await titleLocator.textContent();
    expect(actualText).toContain(planName);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Verify the plan title is visible (using correct data-testid attribute)
    const titleLocator = this.page.getByTestId('plan-details-title');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    // Wait for the plan details page to load by ensuring key elements are present
  }
}
