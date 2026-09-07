import { expect, test } from '@playwright/test';

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import { V2_13_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Nutanix Provider Form Validation', () => {
  test(
    'should display Nutanix AHV form fields and validate required fields',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      requireVersion(test, V2_13_0);
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate to provider creation page', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
      });

      await test.step('Select Nutanix AHV provider type', async () => {
        await createProvider.selectProviderType(ProviderType.NUTANIX);
      });

      await test.step('Verify Prism type radio buttons are visible', async () => {
        await expect(page.getByText('Prism Element')).toBeVisible();
        await expect(page.getByText('Prism Central')).toBeVisible();
      });

      await test.step('Verify URL field is visible', async () => {
        await expect(page.getByTestId('nutanix-url-input')).toBeVisible();
      });

      await test.step('Verify credential fields are hidden before URL is filled', async () => {
        await expect(page.getByTestId('nutanix-username-input')).not.toBeVisible();
        await expect(page.getByTestId('nutanix-password-input')).not.toBeVisible();
      });

      await test.step('Fill URL and verify credential fields appear', async () => {
        await page.getByTestId('nutanix-url-input').fill('https://prism.example.com:9440');
        await expect(page.getByTestId('nutanix-username-input')).toBeVisible();
        await expect(page.getByTestId('nutanix-password-input')).toBeVisible();
      });

      await test.step('Verify create button is disabled when fields are empty', async () => {
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill all required fields and verify button becomes enabled', async () => {
        await createProvider.fillProviderName('test-nutanix-validation');
        await page.getByTestId('nutanix-username-input').fill('admin');
        await page.getByTestId('nutanix-password-input').fill('password123');
        await createProvider.certificateSkipRadio.click();
        await expect(createProvider.createButton).toBeEnabled();
      });
    },
  );
});
