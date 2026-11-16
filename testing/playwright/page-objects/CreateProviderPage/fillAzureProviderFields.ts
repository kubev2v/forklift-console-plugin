import type { Page } from '@playwright/test';

import type { ProviderData } from '../../types/test-data';

const ADVANCED_TOGGLE = 'azure-advanced-settings';

export const expandAzureAdvancedSettings = async (page: Page): Promise<void> => {
  const toggle = page.getByTestId(ADVANCED_TOGGLE).getByRole('button');

  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click();
  }
};

export const fillAzureProviderFields = async (
  page: Page,
  testData: ProviderData,
): Promise<void> => {
  await page.getByTestId('azure-tenant-id-input').fill(testData.azureTenantId ?? '');
  await page.getByTestId('azure-subscription-id-input').fill(testData.azureSubscriptionId ?? '');
  await page.getByTestId('azure-client-id-input').fill(testData.azureClientId ?? '');
  await page.getByTestId('azure-client-secret-input').fill(testData.azureClientSecret ?? '');
  await page.getByTestId('azure-resource-group-input').fill(testData.azureResourceGroup ?? '');

  const hasAdvancedSettings = [
    testData.azureSnapshotResourceGroup,
    testData.azureSnapshotSku,
    testData.azureTargetRegion,
    testData.azureVolumeSnapshotClassName,
  ].some(Boolean);

  if (!hasAdvancedSettings) {
    return;
  }

  await expandAzureAdvancedSettings(page);

  if (testData.azureSnapshotResourceGroup) {
    await page
      .getByTestId('azure-snapshot-resource-group-input')
      .fill(testData.azureSnapshotResourceGroup);
  }

  if (testData.azureSnapshotSku) {
    await page.getByTestId('azure-snapshot-sku-select').click();
    await page.getByRole('option', { name: testData.azureSnapshotSku }).click();
  }

  if (testData.azureTargetRegion) {
    await page.getByTestId('azure-target-region-input').fill(testData.azureTargetRegion);
  }

  if (testData.azureVolumeSnapshotClassName) {
    await page
      .getByTestId('azure-volume-snapshot-class-input')
      .fill(testData.azureVolumeSnapshotClassName);
  }
};
