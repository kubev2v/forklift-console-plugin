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
    await expect(this.page.locator('[data-test-id="breadcrumb-link-0"]')).toContainText('Plans');
    await expect(this.page.locator('.pf-v5-c-breadcrumb__item').last()).toContainText(
      'Plan Details',
    );
  }

  async verifyNavigationTabs(): Promise<void> {
    // Verify Details tab is currently selected
    await expect(this.page.locator('[data-test-id="horizontal-link-Details"]')).toHaveAttribute(
      'aria-selected',
      'true',
      { timeout: 5000 },
    );
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
    await expect(
      planDetailsSection.locator(`a[data-test-id="${planData.planProject}"]`),
    ).toBeVisible();

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
    const titleLocator = this.page.locator('[data-testid="plan-details-title"]');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    const actualText = await titleLocator.textContent();
    expect(actualText).toContain(planName);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Verify the plan title is visible (using correct data-testid attribute)
    const titleLocator = this.page.locator('[data-testid="plan-details-title"]');
    await expect(titleLocator).toBeVisible({ timeout: 15000 });

    // Wait for the plan details page to load by ensuring key elements are present
  }
}
