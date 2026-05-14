import { expect, test } from '@playwright/test';

import { CreateProviderPage } from '../../../page-objects/CreateProviderPage';
import { ProviderType } from '../../../types/enums';
import { V2_12_0 } from '../../../utils/version/constants';
import { requireVersion } from '../../../utils/version/version';

test.describe('EC2 Provider Form Validation', () => {
  requireVersion(test, V2_12_0);

  test(
    'should display all EC2 form fields and toggle conditional sections',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page);

      await test.step('Navigate to create provider, select EC2 type', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.EC2);
      });

      await test.step('Verify base EC2 fields are visible', async () => {
        await expect(createProvider.ec2RegionInput).toBeVisible();
        await expect(createProvider.ec2AccessKeyIdInput).toBeVisible();
        await expect(createProvider.ec2SecretAccessKeyInput).toBeVisible();
      });

      await test.step('Verify auto-detect checkbox is unchecked by default', async () => {
        await expect(createProvider.ec2AutoTargetCheckbox).not.toBeChecked();
      });

      await test.step('Verify target AZ and target region are visible when auto-detect is off', async () => {
        await expect(createProvider.ec2TargetAzInput).toBeVisible();
        await expect(createProvider.ec2TargetRegionInput).toBeVisible();
      });

      await test.step('Check auto-detect and verify target AZ and region are hidden', async () => {
        await createProvider.ec2AutoTargetCheckbox.click();
        await expect(createProvider.ec2AutoTargetCheckbox).toBeChecked();
        await expect(createProvider.ec2TargetAzInput).not.toBeVisible();
        await expect(createProvider.ec2TargetRegionInput).not.toBeVisible();
      });

      await test.step('Uncheck auto-detect and verify target fields reappear', async () => {
        await createProvider.ec2AutoTargetCheckbox.click();
        await expect(createProvider.ec2AutoTargetCheckbox).not.toBeChecked();
        await expect(createProvider.ec2TargetAzInput).toBeVisible();
        await expect(createProvider.ec2TargetRegionInput).toBeVisible();
      });

      await test.step('Check cross-account credentials and verify target key fields appear', async () => {
        await createProvider.ec2CrossAccountCheckbox.click();
        await expect(createProvider.ec2TargetAccessKeyIdInput).toBeVisible();
        await expect(createProvider.ec2TargetSecretAccessKeyInput).toBeVisible();
      });

      await test.step('Uncheck cross-account credentials and verify target key fields are hidden', async () => {
        await createProvider.ec2CrossAccountCheckbox.click();
        await expect(createProvider.ec2TargetAccessKeyIdInput).not.toBeVisible();
        await expect(createProvider.ec2TargetSecretAccessKeyInput).not.toBeVisible();
      });
    },
  );

  test(
    'should validate required fields for EC2 provider',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page);

      await test.step('Select EC2 type', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.EC2);
      });

      await test.step('Verify Create button is disabled when the form is empty', async () => {
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill provider name only — button stays disabled', async () => {
        await createProvider.fillProviderName('test-ec2-required-fields');
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill region — button stays disabled', async () => {
        await createProvider.ec2RegionInput.fill('us-east-2');
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill access key ID — button stays disabled', async () => {
        await createProvider.ec2AccessKeyIdInput.fill('AKIA_TEST_KEY');
        await expect(createProvider.createButton).toBeDisabled();
      });

      await test.step('Fill secret access key — button becomes enabled', async () => {
        await createProvider.ec2SecretAccessKeyInput.fill('secret-key-value');
        await expect(createProvider.createButton).toBeEnabled();
      });
    },
  );

  test(
    'should not show certificate validation section for EC2',
    {
      tag: '@downstream',
    },
    async ({ page }) => {
      const createProvider = new CreateProviderPage(page);

      await test.step('Select EC2 type', async () => {
        await createProvider.navigate();
        await createProvider.waitForWizardLoad();
        await createProvider.selectProviderType(ProviderType.EC2);
      });

      await test.step('Verify certificate validation controls are not shown', async () => {
        await expect(createProvider.certificateConfigureRadio).not.toBeVisible();
        await expect(createProvider.certificateSkipRadio).not.toBeVisible();
        await expect(createProvider.certificateUploadInput).not.toBeVisible();
      });
    },
  );
});
