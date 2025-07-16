import { test, expect } from '@playwright/test';
import { PlansListPage } from '../page-objects/PlansListPage';
import { CreatePlanWizardPage } from '../page-objects/CreatePlanWizardPage';
import { TEST_DATA, createTestPlan } from '../fixtures/test-data';
import { setupCreatePlanIntercepts } from '../utils/api-intercepts';


test.describe('Plans - Critical End-to-End Migration', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatePlanIntercepts(page);
    const plansPage = new PlansListPage(page);
    await plansPage.navigateFromMainMenu();
  });

  test('should show Create Plan button on list page', async ({ page }) => {
    const plansPage = new PlansListPage(page);
  
   
    await plansPage.waitForPageLoad();
    await plansPage.clickCreatePlanButton();
  });

  test('should complete full migration plan lifecycle', async ({ page }) => {
    const plansPage = new PlansListPage(page);
    const createWizard = new CreatePlanWizardPage(page);

    // 2. Create New Plan
    await plansPage.clickCreatePlanButton();
    
    // 3. Fill Plan Details (Step 1)
    await createWizard.fillPlanName(TEST_DATA.planName);
    await createWizard.fillPlanDescription('End-to-end test migration plan');
    await createWizard.selectTargetNamespace(TEST_DATA.targetProject);
    await createWizard.clickNext();

    // 4. Select Source Provider (Step 2)
    await createWizard.verifyCurrentStep(2);
    await createWizard.selectSourceProvider(TEST_DATA.sourceProvider);
    await createWizard.clickNext();

    // 5. Select Target Provider (Step 3)
    await createWizard.verifyCurrentStep(3);
    await createWizard.selectTargetProvider(TEST_DATA.targetProvider);
    await createWizard.clickNext();

    // 6. Select VMs (Step 4)
    await createWizard.verifyCurrentStep(4);
    await createWizard.selectVirtualMachine(TEST_DATA.virtualMachines[0].name);
    await createWizard.clickNext();

    // 7. Network Mapping (Step 5)
    await createWizard.verifyCurrentStep(5);
    // Network mapping logic here
    await createWizard.clickNext();

    // 8. Storage Mapping (Step 6)
    await createWizard.verifyCurrentStep(6);
    // Storage mapping logic here
    await createWizard.clickNext();

    // 9. Review and Create (Step 7)
    await createWizard.verifyCurrentStep(7);
    await createWizard.clickFinish();

    // 10. Verify Plan Creation
    await createWizard.verifyPlanCreated(TEST_DATA.planName);
    
    // 11. Verify Plan Appears in List
    expect(page.url()).toContain('forklift.konveyor.io~v1beta1~Plan');
    await expect(page.getByText(TEST_DATA.planName)).toBeVisible();

    // 12. Verify Plan Status
    await expect(page.getByTestId('plan-status-ready')).toBeVisible();
  });

  test('should handle plan validation errors gracefully', async ({ page }) => {
    const plansPage = new PlansListPage(page);
    const createWizard = new CreatePlanWizardPage(page);
    
    await plansPage.navigateFromMainMenu();
    await plansPage.clickCreatePlanButton();

    // Try to proceed without filling required fields
    await createWizard.clickNext();
    
    // Verify validation errors
    await expect(page.getByText('Plan name is required')).toBeVisible();
    await expect(page.getByText('Target namespace is required')).toBeVisible();
  });


}); 