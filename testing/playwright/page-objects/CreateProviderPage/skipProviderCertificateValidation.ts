import { expect, type Page } from '@playwright/test';

import { V2_11_0, V5_0_0 } from '../../utils/version/constants';
import { isVersionAtLeast } from '../../utils/version/version';

export const skipProviderCertificateValidation = async (page: Page): Promise<void> => {
  if (!isVersionAtLeast(V2_11_0)) {
    await page
      .getByRole('checkbox', { name: /Skip certificate validation/i })
      .check({ force: true });
    return;
  }

  const skipRadio = page.getByTestId('certificate-validation-skip');
  await skipRadio.click();

  // MTV 5.0+ opens a confirm modal; without accepting it the form stays on
  // Configure (empty CA) and Create provider remains disabled.
  if (isVersionAtLeast(V5_0_0)) {
    const confirmSkip = page.getByTestId('confirm-skip-certificate-validation');
    await expect(confirmSkip).toBeVisible();
    await confirmSkip.click();
  }

  await expect(skipRadio).toBeChecked();
};
