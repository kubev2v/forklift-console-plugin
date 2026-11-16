import { expect, test } from '@playwright/test';

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import { requireAzureProviderConfig } from '../../../utils/azure/azure';
import { V5_1_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('Azure Provider Form Validation', () => {
  requireVersion(test, V5_1_0);
  requireAzureProviderConfig(test);

  test(
    'should display all Azure form fields and toggle advanced settings',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate to create provider and select Azure', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.AZURE);
      });

      await test.step('Verify service principal fields are visible', async () => {
        await expect(createProvider.azureTenantIdInput).toBeVisible();
        await expect(createProvider.azureSubscriptionIdInput).toBeVisible();
        await expect(createProvider.azureClientIdInput).toBeVisible();
        await expect(createProvider.azureClientSecretInput).toBeVisible();
        await expect(createProvider.azureResourceGroupInput).toBeVisible();
      });

      await test.step('Verify advanced settings are collapsed by default', async () => {
        await expect(createProvider.azureAdvancedSettingsToggle).toHaveAttribute(
          'aria-expanded',
          'false',
        );
        await expect(createProvider.azureSnapshotResourceGroupInput).toBeHidden();
      });

      await test.step('Expand advanced settings and verify the fields', async () => {
        await createProvider.azureAdvancedSettingsToggle.click();
        await expect(createProvider.azureSnapshotResourceGroupInput).toBeVisible();
        await expect(createProvider.azureSnapshotSkuSelect).toBeVisible();
        await expect(createProvider.azureTargetRegionInput).toBeVisible();
        await expect(createProvider.azureVolumeSnapshotClassNameInput).toBeVisible();
      });

      await test.step('Require a resource group or a snapshot resource group', async () => {
        await createProvider.azureResourceGroupInput.fill('');
        await createProvider.azureSnapshotResourceGroupInput.fill('');
        await expect(
          page.getByText('Enter a resource group or a snapshot resource group'),
        ).toBeVisible();
      });
    },
  );
});
