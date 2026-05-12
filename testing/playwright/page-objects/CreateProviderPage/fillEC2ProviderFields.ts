import type { Page } from '@playwright/test';

import type { ProviderData } from '../../types/test-data';

export const fillEC2ProviderFields = async (page: Page, testData: ProviderData): Promise<void> => {
  await page.getByTestId('ec2-region-input').fill(testData.ec2Region ?? '');
  await page.getByTestId('ec2-access-key-id-input').fill(testData.accessKeyId ?? '');
  await page.getByTestId('ec2-secret-access-key-input').fill(testData.secretAccessKey ?? '');

  const autoTargetCheckbox = page.getByTestId('ec2-auto-target-credentials-checkbox');
  if (testData.autoTargetCredentials === false) {
    if (await autoTargetCheckbox.isChecked()) {
      await autoTargetCheckbox.click();
    }
    await page.getByTestId('ec2-target-az-input').fill(testData.targetAz ?? '');
    await page.getByTestId('ec2-target-region-input').fill(testData.targetRegion ?? '');
  } else if (testData.autoTargetCredentials === true) {
    if (!(await autoTargetCheckbox.isChecked())) {
      await autoTargetCheckbox.click();
    }
  }

  if (testData.crossAccountCredentials) {
    const crossCheckbox = page.getByTestId('ec2-cross-account-credentials-checkbox');
    if (!(await crossCheckbox.isChecked())) {
      await crossCheckbox.click();
    }
    await page.getByTestId('ec2-target-access-key-id-input').fill(testData.targetAccessKeyId ?? '');
    await page
      .getByTestId('ec2-target-secret-access-key-input')
      .fill(testData.targetSecretAccessKey ?? '');
  } else if (testData.crossAccountCredentials === false) {
    const crossCheckbox = page.getByTestId('ec2-cross-account-credentials-checkbox');
    if (await crossCheckbox.isChecked()) {
      await crossCheckbox.click();
    }
  }
};
