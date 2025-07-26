import { expect, type Page } from '@playwright/test';

export class PlanDetailsPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyBasicPlanDetailsPage(planData: {
    planName: string;
    planProject: string;
    targetProject: string;
  }) {
    // eslint-disable-next-line no-console
    console.log('🔧 PAGE OBJECT - verifyBasicPlanDetailsPage called with:', planData);

    // Simplified verification focusing on core plan details that should always be present
    await this.verifyPlanDetailsURL(planData.planName);
    await this.verifyPlanTitle(planData.planName);
    await this.verifyPlanStatus();
    await this.verifyBreadcrumbs();
    await this.verifyNavigationTabs();
    await this.verifyPlanDetails(planData);
  }

  async verifyBreadcrumbs() {
    // Verify breadcrumb navigation
    await expect(this.page.locator('[data-test-id="breadcrumb-link-0"]')).toContainText('Plans');
    await expect(this.page.locator('.pf-v5-c-breadcrumb__item').last()).toContainText(
      'Plan Details',
    );
  }

  async verifyNavigationTabs() {
    // Verify the navigation tabs are present (using data-test-id instead of data-testid)

    // Verify all tabs are visible
    await expect(this.page.locator('[data-test-id="horizontal-link-Details"]')).toBeVisible();
    await expect(this.page.locator('[data-test-id="horizontal-link-YAML"]')).toBeVisible();
    await expect(
      this.page.locator('[data-test-id="horizontal-link-Virtual machines"]'),
    ).toBeVisible();
    await expect(this.page.locator('[data-test-id="horizontal-link-Resources"]')).toBeVisible();
    await expect(this.page.locator('[data-test-id="horizontal-link-Mappings"]')).toBeVisible();
    await expect(this.page.locator('[data-test-id="horizontal-link-Hooks"]')).toBeVisible();

    // Verify Details tab is currently selected
    await expect(this.page.locator('[data-test-id="horizontal-link-Details"]')).toHaveAttribute(
      'aria-selected',
      'true',
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

  async verifyPlanTitle(planName: string) {
    // eslint-disable-next-line no-console
    console.log('🔧 PAGE OBJECT - verifyPlanTitle called with planName:', planName);

    // Check what the element actually contains
    const titleElement = this.page.getByTestId('plan-details-title');
    const actualText = await titleElement.textContent();
    // eslint-disable-next-line no-console
    console.log('🔧 PAGE OBJECT - plan-details-title actual text:', `"${actualText}"`);

    // Verify the plan title with icon and name
    await expect(this.page.getByTestId('plan-details-title')).toBeVisible();
    await expect(this.page.getByTestId('plan-details-title')).toContainText(planName);
  }

  async waitForPageLoad() {
    // eslint-disable-next-line no-console
    console.log('🔧 PAGE OBJECT - waitForPageLoad called');

    // Wait for the plan details page to load by ensuring key elements are present
    // Don't wait for provider spinner since we're not mocking provider details API
    await expect(this.page.getByTestId('plan-details-title')).toBeVisible({
      timeout: 30000,
    });

    // Check what the title shows after loading
    const titleElement = this.page.getByTestId('plan-details-title');
    const actualText = await titleElement.textContent();
    // eslint-disable-next-line no-console
    console.log('🔧 PAGE OBJECT - After waitForPageLoad, title text:', `"${actualText}"`);

    // Ensure the main plan details section is loaded - use more specific selector
    await expect(
      this.page
        .locator('section.pf-v5-c-page__main-section')
        .filter({ hasText: 'Plan details' })
        .first(),
    ).toBeVisible({
      timeout: 30000,
    });
  }
}
